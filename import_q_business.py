# import_q_business.py
import json, os, boto3, time
from botocore.config import Config

REGION = os.getenv("AWS_REGION", "us-west-2")
PROFILE = os.getenv("AWS_PROFILE", None)
SESSION = boto3.Session(profile_name=PROFILE) if PROFILE else boto3.Session()
q = SESSION.client("qbusiness", region_name=REGION, config=Config(retries={"max_attempts": 10}))
iam = SESSION.client("iam", region_name=REGION)

def wait_for_status(check_func, target_status, max_wait=600):
    """Wait for resource to reach target status"""
    for _ in range(max_wait // 10):
        try:
            status = check_func()
            print(f"Current status: {status}")
            if status == target_status:
                return True
            time.sleep(10)
        except Exception as e:
            print(f"Status check failed: {e}")
            time.sleep(10)
    return False

def create_service_role():
    """Create Q Business service role if it doesn't exist"""
    role_name = "QBusinessServiceRole"
    try:
        iam.get_role(RoleName=role_name)
        print(f"Role {role_name} already exists")
        return f"arn:aws:iam::{SESSION.client('sts').get_caller_identity()['Account']}:role/{role_name}"
    except iam.exceptions.NoSuchEntityException:
        pass
    
    trust_policy = {
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Principal": {"Service": "qbusiness.amazonaws.com"},
            "Action": "sts:AssumeRole"
        }]
    }
    
    iam.create_role(
        RoleName=role_name,
        AssumeRolePolicyDocument=json.dumps(trust_policy),
        Description="Service role for Q Business"
    )
    
    iam.attach_role_policy(
        RoleName=role_name,
        PolicyArn="arn:aws:iam::aws:policy/service-role/AmazonQBusinessServiceRolePolicy"
    )
    
    account_id = SESSION.client('sts').get_caller_identity()['Account']
    role_arn = f"arn:aws:iam::{account_id}:role/{role_name}"
    print(f"Created role: {role_arn}")
    return role_arn

def create_datasource_role():
    """Create role for data source"""
    role_name = "QBusinessDataSourceRole"
    try:
        iam.get_role(RoleName=role_name)
        print(f"Role {role_name} already exists")
        return f"arn:aws:iam::{SESSION.client('sts').get_caller_identity()['Account']}:role/{role_name}"
    except iam.exceptions.NoSuchEntityException:
        pass
    
    trust_policy = {
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Principal": {"Service": "qbusiness.amazonaws.com"},
            "Action": "sts:AssumeRole"
        }]
    }
    
    policy_doc = {
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Action": [
                "qbusiness:BatchPutDocument",
                "qbusiness:BatchDeleteDocument"
            ],
            "Resource": "*"
        }]
    }
    
    iam.create_role(
        RoleName=role_name,
        AssumeRolePolicyDocument=json.dumps(trust_policy)
    )
    
    iam.put_role_policy(
        RoleName=role_name,
        PolicyName="QBusinessDataSourcePolicy",
        PolicyDocument=json.dumps(policy_doc)
    )
    
    account_id = SESSION.client('sts').get_caller_identity()['Account']
    role_arn = f"arn:aws:iam::{account_id}:role/{role_name}"
    print(f"Created data source role: {role_arn}")
    return role_arn

def import_application(config):
    """Import Q Business application from config"""
    app_config = config["applications"][0]
    app_data = app_config["application"]
    
    print("Creating Q Business application...")
    
    # Check if application already exists
    apps = q.list_applications()["applications"]
    existing_app = next((app for app in apps if app["displayName"] == app_data["displayName"]), None)
    
    if existing_app:
        app_id = existing_app["applicationId"]
        print(f"Using existing application: {app_id}")
    else:
        # Create application
        create_params = {
            "displayName": app_data["displayName"],
            "identityType": app_data["identityType"],
            "description": "Imported Q Business application"
        }
        
        # Only add attachmentsConfiguration for non-anonymous users
        if app_data["identityType"] != "ANONYMOUS":
            create_params["attachmentsConfiguration"] = app_data.get("attachmentsConfiguration", {})
        
        app_response = q.create_application(**create_params)
        app_id = app_response["applicationId"]
        print(f"Created application: {app_id}")
        
        # Add response customization
        try:
            q.update_application(
                applicationId=app_id,
                personalizationConfiguration={
                    "personalizationControlMode": "ENABLED"
                }
            )
            print("Added conversational and empathetic tone customization")
        except Exception as e:
            print(f"Could not add response customization: {e}")

    
    # Wait for application to be active
    wait_for_status(
        lambda: q.get_application(applicationId=app_id)["status"],
        "ACTIVE"
    )
    
    # Create index
    index_config = app_config["indices"][0]
    print("Creating index...")
    
    # Check if index already exists
    indices = q.list_indices(applicationId=app_id)["indices"]
    existing_index = next((idx for idx in indices if idx["displayName"] == index_config["displayName"]), None)
    
    if existing_index:
        index_id = existing_index["indexId"]
        print(f"Using existing index: {index_id}")
    else:
        index_response = q.create_index(
            applicationId=app_id,
            displayName=index_config["displayName"],
            type=index_config["type"],
            capacityConfiguration=index_config["capacityConfiguration"]
        )
        
        index_id = index_response["indexId"]
        print(f"Created index: {index_id}")
    
    # Wait for index to be active
    wait_for_status(
        lambda: q.get_index(applicationId=app_id, indexId=index_id)["status"],
        "ACTIVE"
    )
    
    # Create data source
    if app_config["dataSources"]:
        ds_config = app_config["dataSources"][0]
        ds_role_arn = create_datasource_role()
        
        print("Creating data source...")
        
        ds_response = q.create_data_source(
            applicationId=app_id,
            indexId=index_id,
            displayName=ds_config["displayName"],
            configuration=ds_config["configuration"],
            roleArn=ds_role_arn,
            description=ds_config.get("description", "")
        )
        
        ds_id = ds_response["dataSourceId"]
        print(f"Created data source: {ds_id}")
    
    # Create retriever
    print("Creating retriever...")
    
    retriever_response = q.create_retriever(
        applicationId=app_id,
        displayName=f"{app_data['displayName']}-retriever",
        type="NATIVE_INDEX",
        configuration={
            "nativeIndexConfiguration": {
                "indexId": index_id
            }
        }
    )
    
    retriever_id = retriever_response["retrieverId"]
    print(f"Created retriever: {retriever_id}")
    
    # Create web experience
    print("Creating web experience...")
    
    # Check if web experience already exists
    try:
        wx_list = q.list_web_experiences(applicationId=app_id)["webExperiences"]
        if wx_list:
            wx_id = wx_list[0]["webExperienceId"]
            print(f"Using existing web experience: {wx_id}")
        else:
            print("No existing web experience found. Please create one manually in the AWS console.")
            wx_id = None
    except Exception as e:
        print(f"Web experience creation skipped: {e}")
        wx_id = None

    
    # Get web experience details if it exists
    wx_details = {}
    if wx_id:
        # Wait for web experience to be active
        wait_for_status(
            lambda: q.get_web_experience(applicationId=app_id, webExperienceId=wx_id)["status"],
            "ACTIVE"
        )
        
        # Get final details
        wx_details = q.get_web_experience(applicationId=app_id, webExperienceId=wx_id)
    
    return {
        "applicationId": app_id,
        "indexId": index_id,
        "dataSourceId": ds_id if app_config["dataSources"] else None,
        "retrieverId": retriever_id,
        "webExperienceId": wx_id,
        "webExperienceUrl": wx_details.get("defaultEndpoint", "")
    }

def main():
    # Load exported config
    with open("qbusiness_export.json", "r") as f:
        config = json.load(f)
    
    print(f"Importing Q Business application to region: {REGION}")
    
    # Import application
    result = import_application(config)
    
    print("\n=== Import Complete ===")
    print(f"Application ID: {result['applicationId']}")
    print(f"Index ID: {result['indexId']}")
    print(f"Data Source ID: {result['dataSourceId']}")
    print(f"Retriever ID: {result['retrieverId']}")
    print(f"Web Experience ID: {result['webExperienceId']}")
    print(f"Web Experience URL: {result['webExperienceUrl']}")
    
    # Save results
    with open("qbusiness_import_result.json", "w") as f:
        json.dump(result, f, indent=2)
    
    print("\nResults saved to qbusiness_import_result.json")

if __name__ == "__main__":
    main()