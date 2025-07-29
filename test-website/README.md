# Floating Chat Widget Test Website

## How to Test

### 1. Start the React App
```bash
cd frontend
npm start
```
This starts the React app on `http://localhost:3000`

### 2. Serve the Test Website
```bash
cd test-website
python3 -m http.server 8080
```
Or use any local server. The test site will be at `http://localhost:8080`

### 3. Test Cross-Page Functionality

1. **Open** `http://localhost:8080/index.html`
2. **Look for** chat button (💬) in bottom-right corner
3. **Click** chat button to open widget
4. **Send** a test message and get response
5. **Navigate** to About page using menu
6. **Verify** chat conversation persists
7. **Continue** to Services and Contact pages
8. **Confirm** conversation maintains across all pages

### 4. Test Scenarios

#### ✅ Basic Functionality
- Chat button appears on all pages
- Widget opens/closes properly
- Messages send and receive correctly

#### ✅ Cross-Page Persistence
- Navigate: Home → About → Services → Contact
- Conversation history maintained
- Session cookie works across pages

#### ✅ Browser Compatibility
- Test in Chrome, Safari, Firefox, Edge, Brave
- Mobile responsive design
- Touch device compatibility

#### ✅ Session Management
- Same browser session = same conversation
- New browser session = fresh start
- Multiple tabs = shared conversation

### 5. Expected Behavior

- **Session Cookie**: Maintains conversation across pages
- **Widget State**: Consistent UI across all pages
- **Message History**: Full conversation visible on every page
- **Responsive**: Works on desktop, tablet, mobile

### 6. Troubleshooting

If widget doesn't appear:
1. Check browser console for errors
2. Verify React app is running on port 3000
3. Check CORS settings if needed
4. Ensure both servers are running

The test website simulates a real client website with multiple pages and demonstrates the floating chat widget's cross-page functionality.