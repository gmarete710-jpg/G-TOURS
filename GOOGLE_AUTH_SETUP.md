# Google Authentication Setup Guide for G Tours Kenya

Your project already has complete Google authentication implemented! Follow these steps to activate it:

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"NEW PROJECT"**
4. Enter project name: **G Tours Kenya**
5. Click **"CREATE"**
6. Wait for the project to be created (this may take a minute)

## Step 2: Enable Google Identity Services API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for **"Google+ API"** or **"Identity"**
3. Click on **"Google+ API"**
4. Click **"ENABLE"**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**
4. If prompted, click **"Configure OAuth consent screen"** first:
   - Choose **External** user type
   - Fill in the required fields:
     - App name: **G Tours Kenya**
     - User support email: Your email
     - Developer contact: Your email
   - Click **SAVE AND CONTINUE** through all pages
   - Return to credentials
5. For the OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: **G Tours Kenya Web Client**

## Step 4: Configure Authorized Origins

In the OAuth 2.0 Client ID creation form, add these **Authorized JavaScript origins**:

```
http://localhost:5500
http://localhost:3000
http://localhost:8000
http://127.0.0.1:5500
```

If deploying to GitHub Pages, also add:
```
https://yourusername.github.io
```

Click **CREATE** to generate your credentials.

## Step 5: Copy Your Client ID

1. You'll see your new OAuth 2.0 Client ID credential
2. Click on it to view details
3. Copy the **Client ID** (ends with `.apps.googleusercontent.com`)

## Step 6: Add Client ID to Your Project

1. Open `auth-config.js` in VS Code
2. Replace `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` with your actual Client ID
3. Example:
   ```javascript
   window.GOOGLE_AUTH_CONFIG = {
       clientId: '123456789-abcdefghijk.apps.googleusercontent.com'
   };
   ```
4. Save the file

## Step 7: Test Your Setup

1. Open your project in a local server (e.g., Live Server on port 5500)
2. You should see a **"Sign in with Google"** button in the top navigation
3. Click it and sign in with your Google account
4. Your profile information should appear in the navbar

## What's Already Implemented

✅ **Login**: Google Sign-In button with popup modal
✅ **User Profile**: Avatar, name, and email display in navbar
✅ **Profile Editor**: Users can edit their name, phone, bio, and profile picture
✅ **Form Auto-fill**: Contact forms auto-populate with authenticated user data
✅ **Logout**: Sign out functionality with session revocation
✅ **Data Storage**: User info persisted in browser's localStorage
✅ **Responsive UI**: Mobile-friendly authentication UI

## Features for Users

After signing in, users can:
- View their profile picture and name in the navbar
- Click "Edit" to update their profile (name, phone, bio, profile picture)
- Auto-fill contact forms with their information
- Sign out when done

## Testing Credentials

For local testing:
- Use your personal Google account
- Create test emails if you want separate testing accounts
- Google will let you use the same email for testing

## Troubleshooting

**Issue**: "Could not load Google Sign-In" message
- Verify the Client ID is correct in `auth-config.js`
- Clear browser cache and reload
- Check browser console for errors (F12)

**Issue**: "Add your Google Client ID" warning appears
- Make sure you've added the Client ID to `auth-config.js`
- Verify there's no 'YOUR_' text remaining in the Client ID

**Issue**: CORS or origin errors
- Add your server URL to "Authorized JavaScript origins" in Google Cloud
- Include both http:// and https:// if applicable
- Include the port number (e.g., :5500)

**Issue**: Sign-in button doesn't work
- Verify the Google Sign-In script loaded in Index.html
- Check browser console for network errors
- Try a different browser to rule out caching issues

## Security Notes

- Never commit `auth-config.js` with a real Client ID to public repos
- Consider using environment variables for production
- The Client ID is meant to be public (web browsers see it anyway)
- User data is stored locally only - no server-side storage implemented

## Next Steps (Optional)

To enhance authentication further:
1. Add backend authentication with a Node.js/Python server
2. Store user data in a database instead of localStorage
3. Implement role-based access control
4. Add email verification
5. Store user preferences and booking history

---

**Questions?** Check the browser console (F12) for detailed error messages and network requests.
