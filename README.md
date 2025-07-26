# Da Box

This project is a NextJS clone of Google Drive.  
You can check it out at: https://da-box.netlify.app/

## TODO:

- [x] Set up local database and data model
- [ ] Set up remote database
- [x] Move folder open state to URL
- [ ] Add auth
- [ ] Add file uploading
- [ ] Date, size filtering

## Note from 7/21/2025

Configured test db connection, next steps:

- [x] Publically host db
- [x] Set env on deployment server
- [x] Update schema to show files and folders
- [x] Manually insert examples
- [x] Render them in the UI
- [ ] QA and deploy 👍!

## Note from 7/22/2025

- [x] Change folders to link components, remove all client state
- [x] Clean up the database and data fetching patterns
- [ ] Add a homepage

# Note from 7/27/2025

- [ ] Add onboarding page (set username)
- [x] Change sign-in page design
- [ ] Change sign-up page design
- [ ] Add sign-up button to sign-in page
- [ ] Add sign-out page

## Platforms

We are using Netlify as our host.
Supabase as a database provider.
GitHub for OAuth: https://github.com/settings/developers
Google for OAuth: https://console.developers.google.com/apis/credentials
