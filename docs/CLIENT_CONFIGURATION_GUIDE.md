# Client Configuration Guide
## Crohn's Colitis Q Business Application

This guide helps clients modify application settings without requiring code changes or redeployment.

---

## 📧 Email Configuration

### **Change Email Addresses**
**Location:** AWS Lambda Console
**Steps:**
1. Go to **AWS Console** → **Lambda**
2. Find function: `YourStackName-EmailLambdaFunction-XXXXX`
3. Click **Configuration** → **Environment variables**
4. Click **Edit** and modify:
   - `SOURCE_EMAIL` = your-new-email@domain.com
   - `DESTINATION_EMAIL` = your-new-destination@domain.com
5. Click **Save**

**Important:** Verify new source email in **SES Console** → **Verified identities** first!

---

## 🖼️ Marketing Images & Assets

### **Chat Bot Avatar**
**Location:** `Frontend/src/Assets/Group 17.png`
**Steps:**
1. Replace file with new bot avatar (40x40px recommended)
2. Keep same filename or update import in `AmazonQChat.jsx`
3. Redeploy frontend

### **User Avatar**
**Location:** `Frontend/src/Assets/User Avatar.png`
**Steps:**
1. Replace file with new user avatar (40x40px recommended)
2. Keep same filename or update import in `AmazonQChat.jsx`
3. Redeploy frontend

### **Website Logo/Branding**
**Location:** `Frontend/public/` directory
**Files to modify:**
- `favicon.ico` - Browser tab icon
- `logo192.png` - App icon (192x192px)
- `logo512.png` - App icon (512x512px)
- `manifest.json` - Update app name and description

---

## 🎨 UI Text & Translations

### **Chat Messages**
**Location:** `Frontend/src/utils/translations.js`
**Modifiable text:**
- Welcome message
- Example questions
- Error messages
- Button labels
- Disclaimer text

**Steps:**
1. Edit `translations.js` file
2. Modify text in both `en` and `es` sections
3. Redeploy frontend

### **Example Questions**
**Current questions:**
- "What is IBD?"
- "What is Crohn's disease?"
- "What is UC (Ulcerative colitis)?"

**To change:** Edit `exampleQuestions` array in `translations.js`

---

## ⚙️ Application Settings

### **Chat Behavior**
**Location:** `Frontend/src/config.js`
**Configurable:**
- API endpoints
- Timeout settings
- Debug logging
- UI messages

### **Idle Timer Settings**
**Location:** `Frontend/src/utils/useIdleTimer.js`
**Current:** 20 seconds idle → prompt, 25 seconds → auto-close
**To change:** Modify timeout values in the hook

---

## 🔗 Data Sources

### **Add/Remove Medical Websites**
**Location:** AWS Q Business Console
**Steps:**
1. Go to **Q Business Console** → **Applications**
2. Click your application → **Data sources**
3. Click existing data source → **Edit**
4. Modify **Seed URLs** list
5. Click **Save** and **Sync**

**Current sources:**
- https://www.crohnscolitisfoundation.org/
- https://gastro.org/
- https://www.crohnscolitiscommunity.org/crohns-colitis-expert-qa

---

## 🌐 Language Settings

### **Add New Language**
**Location:** `Frontend/src/utils/translations.js`
**Steps:**
1. Add new language object (e.g., `fr: { ... }`)
2. Translate all text keys
3. Update language selector in `LanguageSelector.jsx`
4. Add translation support in `TranslationService.js`

### **Change Default Language**
**Location:** `Frontend/src/utils/LanguageContext.js`
**Change:** `defaultLanguage` value from `'en'` to desired language

---

## 📱 Responsive Design

### **Chat Widget Size**
**Location:** `Frontend/src/Components/ChatWidget.jsx`
**Modifiable:**
- Widget dimensions
- Mobile breakpoints
- Positioning (bottom-right, bottom-left, etc.)

### **Colors & Theme**
**Location:** `Frontend/src/utils/constants.js`
**Configurable Colors:**
- `PRIMARY_MAIN` = "#444E56" (Main theme color)
- `SECONDARY_MAIN` = "#D3D3D3" (Secondary elements)
- `CHAT_BODY_BACKGROUND` = "#FFFFFF" (Chat background)
- `BOTMESSAGE_BACKGROUND` = "#dbf6ff" (Bot message bubbles)
- `USERMESSAGE_BACKGROUND` = "#dbe3f9" (User message bubbles)
- `BOT_HEADING_COLOR` = "#1d8cca" (Bot header color)
- `CHAT_INPUT_BACKGROUND` = "#dbe3f9" (Input box color)
- `FOLLOWUP_BUTTON_BACKGROUND` = "#fce2cc" (Follow-up button)
- `MARKETING_BUTTON_BACKGROUND` = "#0080ac" (Marketing buttons)

**Steps to Change:**
1. Edit color values in `constants.js`
2. Save file
3. Redeploy frontend

---

## 🔧 Advanced Configuration

### **API Rate Limits**
**Location:** AWS API Gateway Console
**Steps:**
1. Go to **API Gateway** → Your API
2. Click **Usage Plans** → **Throttling**
3. Modify rate and burst limits

### **Database Retention**
**Location:** AWS DynamoDB Console
**Current:** 30 days TTL
**Steps:**
1. Go to **DynamoDB** → **Tables** → Your conversation table
2. Click **Additional settings** → **Time to live**
3. Modify TTL settings

### **Lambda Memory/Timeout**
**Location:** AWS Lambda Console
**Steps:**
1. Go to **Lambda** → Select function
2. Click **Configuration** → **General configuration**
3. Modify **Memory** and **Timeout** settings

---

## 🚀 Deployment After Changes

### **Frontend Changes**
```bash
cd Frontend
npm run build
# Upload to Amplify or S3
```

### **Backend Changes**
```bash
cd Backend
cdk deploy
```

### **No Deployment Needed**
- Email addresses (Lambda env vars)
- Q Business data sources
- Lambda configuration
- API Gateway settings

---

## 📞 Support

For technical assistance with configurations:
1. Check AWS CloudWatch logs for errors
2. Verify all AWS services are in the same region
3. Ensure IAM permissions are correct
4. Contact your development team for code changes

---

## 🔍 Quick Reference

| **What to Change** | **Where to Go** | **Deployment Needed** |
|-------------------|-----------------|----------------------|
| Email addresses | Lambda Console | ❌ No |
| Chat avatars | Frontend/Assets/ | ✅ Yes |
| Text messages | translations.js | ✅ Yes |
| Data sources | Q Business Console | ❌ No |
| Colors/theme | theme.js | ✅ Yes |
| API limits | API Gateway Console | ❌ No |
| Database retention | DynamoDB Console | ❌ No |