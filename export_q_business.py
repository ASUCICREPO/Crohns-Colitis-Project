# export_q_business.py
import json, os, boto3
from botocore.config import Config

REGION = os.getenv("AWS_REGION", "us-west-2")
PROFILE = os.getenv("AWS_PROFILE", None)
SESSION = boto3.Session(profile_name=PROFILE) if PROFILE else boto3.Session()
q = SESSION.client("qbusiness", region_name=REGION, config=Config(retries={"max_attempts": 10}))

def paged(call, key, **kwargs):
    out, token = [], None
    while True:
        if token: kwargs["nextToken"] = token
        resp = call(**kwargs)
        out.extend(resp.get(key, []))
        token = resp.get("nextToken")
        if not token: break
    return out

def export_application(app):
    app_id = app["applicationId"]
    app_full = q.get_application(applicationId=app_id)  # includes personalization, encryption, etc.
    # Indices
    indices = paged(q.list_indices, "indices", applicationId=app_id)
    index_details = []
    for ix in indices:
        gd = q.get_index(applicationId=app_id, indexId=ix["indexId"])
        index_details.append(gd)
    # Data sources
    ds_list = []
    for ix in indices:
        ds_for_index = paged(q.list_data_sources, "dataSources", applicationId=app_id, indexId=ix["indexId"])
        for ds in ds_for_index:
            ds["indexId"] = ix["indexId"]  # Add indexId to each data source
        ds_list.extend(ds_for_index)
    ds_details = []
    for ds in ds_list:
        g = q.get_data_source(applicationId=app_id, indexId=ds["indexId"], dataSourceId=ds["dataSourceId"])
        # Redact likely secret locations
        cfg = g.get("configuration", {})
        # heuristic redaction
        def redact(obj):
            if isinstance(obj, dict):
                return {k: ("***REDACTED***" if "secret" in k.lower() or "token" in k.lower() or "password" in k.lower() or "clientsecret" in k.lower() else redact(v))
                        for k,v in obj.items()}
            if isinstance(obj, list):
                return [redact(v) for v in obj]
            return obj
        g["configuration"] = redact(cfg)
        ds_details.append(g)
    # Plugins (optional, not all accounts use them)
    plugins = paged(q.list_plugins, "plugins", applicationId=app_id)
    plugin_details = []
    for p in plugins:
        try:
            gp = q.get_plugin(applicationId=app_id, pluginId=p["pluginId"])
        except Exception:
            gp = p
        plugin_details.append(gp)
    # Web Experience(s)
    try:
        wx_list = paged(q.list_web_experiences, "webExperiences", applicationId=app_id)
    except Exception:
        wx_list = []
    wx_details = []
    for wx in wx_list:
        try:
            gw = q.get_web_experience(applicationId=app_id, webExperienceId=wx["webExperienceId"])
            # redact IdP client secrets if present
            if "identityProviderConfiguration" in gw:
                gw["identityProviderConfiguration"] = {"**SUPPLY_IN_TARGET**": True}
            wx_details.append(gw)
        except Exception as e:
            print(f"Warning: Could not get web experience details: {e}")
            wx_details.append(wx)

    return {
        "applicationSummary": app,
        "application": app_full,
        "indices": index_details,
        "dataSources": ds_details,
        "plugins": plugin_details,
        "webExperiences": wx_details
    }

def main():
    apps = paged(q.list_applications, "applications")
    out = {"region": REGION, "exportedAt": __import__("datetime").datetime.utcnow().isoformat()+"Z", "applications": []}
    for a in apps:
        out["applications"].append(export_application(a))
    with open("qbusiness_export.json", "w") as f:
        json.dump(out, f, indent=2, default=str)
    print("Wrote qbusiness_export.json")

if __name__ == "__main__":
    main()