# Firebase App Hosting Deployment Guide

This guide will help you deploy your GreenSky Adventures app to Firebase App Hosting.

## Prerequisites

1. **Firebase CLI**: Install the Firebase CLI if you haven't already:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Login**: Log in to your Firebase account:
   ```bash
   firebase login
   ```

3. **Firebase Project**: Make sure you have access to the `green-sky-b545b` project.

## Configuration Steps

### 1. Environment Variables

Create a `.env.production` file with your Firebase configuration:

```bash
cp .env.example .env.production
```

Then edit `.env.production` and replace the placeholder values with your actual Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=green-sky-b545b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=green-sky-b545b
VITE_FIREBASE_STORAGE_BUCKET=green-sky-b545b.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_actual_messaging_sender_id
VITE_FIREBASE_APP_ID=your_actual_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_actual_measurement_id
```

### 2. Get Your Firebase Configuration

To get your Firebase configuration values:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`green-sky-b545b`)
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on your web app or create one if it doesn't exist
6. Copy the configuration values from the `firebaseConfig` object

## Deployment Methods

### Method 1: Using the Deployment Script (Recommended)

Run the deployment script:

```bash
./deploy.sh
```

This script will:
- Check if Firebase CLI is installed and you're logged in
- Verify that `.env.production` exists
- Build your project
- Deploy to Firebase App Hosting

### Method 2: Manual Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Firebase App Hosting**:
   ```bash
   firebase apphosting:backends:deploy --config apphosting.prod.yaml
   ```

## Troubleshooting

### Common Issues

1. **Status Code 9 Error**: This usually indicates:
   - Missing or incorrect environment variables
   - Missing `.firebaserc` file
   - Incorrect Firebase project configuration

2. **Build Failures**: 
   - Check that all environment variables are set correctly
   - Ensure your Firebase configuration is valid
   - Check the build logs for specific error messages

3. **Permission Errors**:
   - Make sure you're logged in to Firebase CLI
   - Verify you have the correct permissions for the project
   - Check that the project ID in `.firebaserc` matches your actual project

### Getting Help

If you encounter issues:

1. Check the Firebase Console for detailed error logs
2. Run `firebase apphosting:backends:list` to see your backends
3. Check the Cloud Build logs in the Google Cloud Console
4. Verify your environment variables are correctly set

## File Structure

```
green-sky-adventures/
├── .firebaserc                 # Firebase project configuration
├── .env.example               # Environment variables template
├── .env.production            # Production environment variables (create this)
├── apphosting.prod.yaml       # App Hosting configuration
├── deploy.sh                  # Deployment script
└── firebase.json              # Firebase hosting configuration
```

## Next Steps

After successful deployment:

1. Your app will be available at the URL provided by Firebase App Hosting
2. You can monitor your app in the Firebase Console
3. Set up custom domains if needed
4. Configure monitoring and analytics

For more information, visit the [Firebase App Hosting documentation](https://firebase.google.com/docs/app-hosting).

