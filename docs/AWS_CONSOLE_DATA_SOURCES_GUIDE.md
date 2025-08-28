# AWS Console Data Sources Guide
## Adding Documents and Websites to Q Business via AWS Console

Step-by-step instructions using only the AWS Console interface.

---

## 📄 Adding Documents via S3 Data Source

### **Step 1: Upload Documents to S3**
1. Go to **AWS Console** → **S3**
2. Click **Create bucket**
3. Enter bucket name: `your-qbusiness-documents`
4. Select region: `us-west-2`
5. Click **Create bucket**
6. Click on your bucket → **Upload**
7. Drag and drop your documents (PDF, DOC, TXT, etc.)
8. Click **Upload**

### **Step 2: Create Data Source in Q Business**
1. Go to **AWS Console** → **Amazon Q Business**
2. Click **Applications** → Select your application
3. Click **Data sources** tab
4. Click **Add data source**
5. Select **Amazon S3**
6. Fill in details:
   - **Data source name**: `Medical Documents`
   - **Description**: `Patient education materials and guidelines`
7. Click **Next**

### **Step 3: Configure S3 Settings**
1. **S3 location**:
   - **Bucket**: Select `your-qbusiness-documents`
2. Click **Next**

### **Step 4: Set IAM Role**
1. **IAM role**: Select **Create a new service role**
2. **Role name**: `QBusinessS3Role`
3. Click **Next**

### **Step 5: Configure Sync Schedule**
1. **Sync run schedule**:
   - Select **Run on demand** (for manual control)
   - OR select **Daily** for automatic updates
2. Click **Next**

### **Step 6: Review and Create**
1. Review all settings
2. Click **Add data source**
3. Click **Sync now** to start indexing

---

## 🌐 Adding Websites via Web Crawler

### **Step 1: Create Web Crawler Data Source**
1. Go to **AWS Console** → **Amazon Q Business**
2. Click **Applications** → Select your application
3. Click **Data sources** tab
4. Click **Add data source**
5. Select **Web crawler**
6. Fill in details:
   - **Data source name**: `Medical Websites`
   - **Description**: `Crohn's and Colitis medical information`
7. Click **Next**

### **Step 2: Configure Source URLs**
1. **Source URLs**:
   - Click **Add URL**
   - Enter: `https://www.crohnscolitisfoundation.org/`
2. **URL scope**: Select **Sync domains with subdomains only**
3. Click **Next**

### **Step 3: Configure Crawl Settings**
1. **Scope settings**:
   - **Crawl depth**: `3`
   - **Max links per page**: `100`
   - **Max content size per page**: `50 MB`
   - **Max URLs per minute crawl rate**: `300`
2. **Include files that web pages link to**:
   - ✅ Check **Crawl index files and attachments**
3. **Content filtering** (optional):
   - **URL inclusion patterns**: Leave blank
   - **URL exclusion patterns**: Enter `*/admin/*, */login/*`
4. Click **Next**

### **Step 4: Set IAM Role**
1. **IAM role**: Select **Create a new service role**
2. **Role name**: `QBusinessWebCrawlerRole`
3. Click **Next**

### **Step 5: Configure Sync Schedule**
1. **Sync run schedule**:
   - Select **Run on demand**
   - OR select **Weekly** for regular updates
2. Click **Next**

### **Step 6: Review and Create**
1. Review all settings
2. Click **Add data source**
3. Click **Sync now** to start crawling

---

## 🔧 **Troubleshooting & Configurations**

### **Common S3 Data Source Issues**

#### **Issue: Sync Failed - Permission Denied**
**Symptoms:** "Access denied" error during sync
**Solution:**
1. Go to **IAM Console** → **Roles**
2. Find role: `QBusinessS3Role`
3. Click **Add permissions** → **Attach policies**
4. Add: `AmazonS3ReadOnlyAccess`
5. **Re-sync** data source

#### **Issue: No Documents Indexed**
**Symptoms:** Sync completes but 0 documents processed
**Solution:**
1. Check **file formats** - only PDF, DOC, TXT, HTML supported
2. Verify **file size** - must be under 50MB
3. Check **bucket permissions** - ensure Q Business can read
4. **Test**: Upload a simple TXT file and re-sync

#### **Issue: Partial Document Processing**
**Symptoms:** Some files indexed, others skipped
**Solution:**
1. **Check file names** - avoid special characters
2. **Verify encoding** - use UTF-8 for text files
3. **Review logs** in CloudWatch for specific errors
4. **Split large files** into smaller chunks

### **Common Web Crawler Issues**

#### **Issue: Web Crawler Failed to Initialize**
**Symptoms:** "Failed validating Web Crawler configuration" error
**Solution:**
1. **Test URLs manually** - verify they load in browser
2. **Check robots.txt**: Visit `https://domain.com/robots.txt`
3. **Reduce crawl settings**:
   - Crawl depth: `2`
   - Max links: `50`
   - Crawl rate: `100 URLs/minute`
4. **Remove problematic URLs** temporarily
5. **Start with single URL** and expand gradually

#### **Issue: Zero Pages Crawled**
**Symptoms:** Sync completes but no pages indexed
**Solution:**
1. **Check URL accessibility**:
   ```bash
   curl -I https://www.crohnscolitisfoundation.org/
   ```
2. **Update URL patterns**:
   - Include: `*.html, */about-*, */treatment-*`
   - Exclude: `*/donate/*, */events/*, */admin/*`
3. **Verify SSL certificates** are valid
4. **Try alternative URLs**:
   ```
   https://www.mayoclinic.org/diseases-conditions/crohns-disease
   https://medlineplus.gov/crohnsdisease.html
   ```

#### **Issue: Crawl Blocked by Website**
**Symptoms:** "Forbidden" or "Access denied" during crawl
**Solution:**
1. **Check robots.txt** compliance
2. **Reduce crawl rate** to `50 URLs/minute`
3. **Add delays** between requests
4. **Contact website owner** for crawling permission
5. **Use alternative medical websites**

### **Data Source Configuration Best Practices**

#### **S3 Bucket Organization:**
```
medical-documents/
├── guidelines/
│   ├── crohns-treatment.pdf
│   └── uc-management.docx
├── patient-education/
│   ├── diet-tips.txt
│   └── medication-guide.pdf
└── research/
    ├── latest-studies.pdf
    └── clinical-trials.html
```

#### **Web Crawler URL Strategy:**
**Start Small:**
```
https://www.crohnscolitisfoundation.org/about-crohns-disease
```

**Expand Gradually:**
```
https://www.crohnscolitisfoundation.org/
https://www.crohnscolitisfoundation.org/about-crohns-disease
https://www.crohnscolitisfoundation.org/about-ulcerative-colitis
```

**Production URLs:**
```
https://www.crohnscolitisfoundation.org/
https://www.mayoclinic.org/diseases-conditions/crohns-disease
https://medlineplus.gov/crohnsdisease.html
https://www.webmd.com/ibd-crohns-disease/
```

### **Monitoring Data Source Health**

#### **Check Sync Status:**
1. **Q Business Console** → **Data sources**
2. **Monitor columns**:
   - **Status**: Should show "Completed"
   - **Documents**: Should show count > 0
   - **Last sync**: Should be recent
   - **Errors**: Should be 0

#### **CloudWatch Monitoring:**
1. Go to **CloudWatch** → **Log groups**
2. Find: `/aws/qbusiness/APPLICATION_ID`
3. **Check for errors**:
   - Permission denied
   - Network timeouts
   - File format errors
   - Crawl failures

#### **Test Data Source Effectiveness:**
1. **Ask specific questions** about uploaded content
2. **Check citations** in responses
3. **Verify source attribution** shows your documents/websites
4. **Test different question types**:
   - General: "What is Crohn's disease?"
   - Specific: "What are biologics for UC?"
   - Treatment: "How to manage Crohn's flare?"

### **Performance Optimization**

#### **S3 Data Source:**
- **File size**: Keep under 10MB for faster processing
- **File format**: PDF and DOCX work best
- **Folder structure**: Organize by topic for easier management
- **Sync frequency**: Daily for active content, weekly for stable docs

#### **Web Crawler:**
- **Crawl depth**: Start with 2, increase to 3 if needed
- **URL limits**: 50-100 links per page maximum
- **Crawl rate**: 100-200 URLs/minute for most sites
- **Content filtering**: Exclude non-medical content

### **Emergency Fixes**

#### **Quick S3 Fix:**
1. **Delete data source**
2. **Create new S3 data source** with single test file
3. **Verify sync works**
4. **Gradually add more documents**

#### **Quick Web Crawler Fix:**
1. **Use reliable medical site**:
   ```
   https://medlineplus.gov/crohnsdisease.html
   ```
2. **Minimal settings**:
   - Depth: 1
   - Links: 10
   - Rate: 50/minute
3. **Test sync**
4. **Expand once working**

### **Verification Checklist**

#### **S3 Data Source:**
- [ ] Bucket exists and accessible
- [ ] Documents uploaded successfully
- [ ] IAM role has S3 read permissions
- [ ] Sync status shows "Completed"
- [ ] Document count > 0
- [ ] Test questions return relevant answers
- [ ] Citations reference uploaded documents

#### **Web Crawler:**
- [ ] URLs accessible in browser
- [ ] robots.txt allows crawling
- [ ] IAM role created successfully
- [ ] Sync status shows "Completed"
- [ ] Pages crawled > 0
- [ ] Test questions return website content
- [ ] Citations show website URLs

---

## 📊 Managing Data Sources

### **Monitor Sync Status**
1. Go to **Q Business Console** → **Applications**
2. Click your application → **Data sources**
3. View status of each data source:
   - **Syncing** - Currently processing
   - **Completed** - Successfully synced
   - **Failed** - Error occurred

### **View Sync History**
1. Click on a data source name
2. Click **Sync history** tab
3. View details of each sync job:
   - Start/end time
   - Documents processed
   - Errors (if any)

### **Manual Sync**
1. Go to data source details
2. Click **Sync now** button
3. Monitor progress in sync history

### **Edit Data Source**
1. Click on data source name
2. Click **Edit** button
3. Modify settings as needed
4. Click **Save changes**

---

## 🔧 Troubleshooting via Console

### **Check Sync Errors**
1. Go to data source → **Sync history**
2. Click on failed sync job
3. View error details and recommendations
4. Common fixes:
   - **Permission errors**: Check IAM role permissions
   - **File format errors**: Verify supported file types
   - **Network errors**: Check URL accessibility

### **View CloudWatch Logs**
1. Go to **AWS Console** → **CloudWatch**
2. Click **Log groups**
3. Find log group: `/aws/qbusiness/your-application-id`
4. Click on log group → View log streams
5. Check for detailed error messages

### **Test Data Source**
1. After successful sync, go to **Q Business Console**
2. Click **Test chat** (if available)
3. Ask questions related to your documents/websites
4. Verify responses include your content

---

## ✅ Verification Steps

### **Confirm S3 Data Source**
1. Check sync status shows **Completed**
2. Verify document count matches uploaded files
3. Test chat with questions about your documents
4. Check response citations reference your S3 content

### **Confirm Web Crawler**
1. Check sync status shows **Completed**
2. Verify pages crawled count
3. Test chat with questions about website content
4. Check response citations reference crawled websites

### **Update Content**
1. **For S3**: Upload new documents to bucket → Click **Sync now**
2. **For websites**: Content updates automatically on next scheduled sync
3. **Manual refresh**: Click **Sync now** anytime

---

## 📋 Quick Reference

### **Supported File Types (S3)**
- Documents: PDF, DOC, DOCX, TXT, RTF
- Presentations: PPT, PPTX
- Data: CSV, JSON, XML
- Web: HTML, HTM
- Maximum size: 50MB per file

### **Web Crawler Limits**
- Max crawl depth: 10 levels
- Max content per page: 50MB
- Max crawl rate: 300 URLs/minute
- Respects robots.txt by default

### **Sync Schedule Options**
- **Run on demand**: Manual sync only
- **Hourly**: Every hour
- **Daily**: Once per day
- **Weekly**: Once per week
- **Custom**: Set specific times

### **IAM Roles Created**
- **S3 Data Source**: Permissions to read S3 bucket
- **Web Crawler**: Permissions to crawl websites
- **Auto-created**: Console creates roles automatically

This guide provides step-by-step AWS Console instructions for adding data sources to your Q Business application.