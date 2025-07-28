# Da Box

This project is a NextJS clone of Google Drive.  
You can check it out at: https://da-box.netlify.app/

## TODO:

- [x] Set up local database and data model
- [x] Set up remote database
- [x] Move folder open state to URL
- [x] Add auth
- [x] Add onboarding page (set name, username, avatar)
- [ ] Add dashboard
- [ ] Add file uploading
- [ ] Date, size filtering
- [ ] Renaming and deletion
- [ ] Access control
- [ ] File view page

## Note from 7/21/2025

Configured test db connection, next steps:

- [x] Publically host db
- [x] Set env on deployment server
- [x] Update schema to show files and folders
- [x] Manually insert examples
- [x] Render them in the UI
- [x] QA and deploy 👍!

## Note from 7/22/2025

- [x] Change folders to link components, remove all client state
- [x] Clean up the database and data fetching patterns
- [ ] Add a homepage

## Note from 7/27/2025

- [x] Add loading state for sign in
- [x] Add error messages for sign in
- [x] Update user data during onboarding

## Note from 7/28/20265

- [ ] Autofill existing data in onboarding
- [ ] Protect onboarding route from unauthenticated users
- [ ] Update file and folder schema
- [ ] Add custom verification page
- [ ] Add file upload

## Platforms

We are using Netlify as our host.
Supabase as a database provider.
GitHub for OAuth: https://github.com/settings/developers
Google for OAuth: https://console.developers.google.com/apis/credentials
