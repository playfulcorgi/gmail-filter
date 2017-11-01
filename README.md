[Docker Hub image is here](https://hub.docker.com/r/playfulcorgi/gmail-filter/)

# Introduction
This Docker image is intended to relieve Gmail (Google Mail) users from the pain of manually sorting incoming e-mails. It will pool a Gmail account every few seconds and reconfigure e-mails from specified senders by removing them from the Inbox and tagging them. It's a quick fix to Gmail's inability to filter incoming e-mails. Gmail's configuration does have a rule for filtering incoming e-mails but was found to be broken and not working automatically, only when executed manually. This Docker image is a temporary fix to that issue.

Running this Docker image is a bit more complicated because it requires access to a Gmail account. Once granted access, it will store credentials received from Google to continuously pool Gmail on its own and without the user's help.

# Step 0: Create the Docker image
If source files for the image are being used instead of the Docker Hub version, simply run `docker build -t playfulcorgi/gmail-filter .` inside the folder with the image's source files.

# Step 1: Create a Google app for personal use
Because Google charges app developers for using their APIs, you will have to create your own app in Google and use it to run the Docker image for your own Gmail account. A large number of API requests to Gmail is free every month and should be enough for the image to run non-stop every few seconds without Google blocking it.

To create an app, go to [this page](https://console.developers.google.com/projectcreate).

![Project name input. First step creating a new Google app.](https://gottocode.com/media/google-developers-new-project-step-1.png "Step 1")

Choose a project name (irrelevant) and click "Create".

![Google project page.](https://gottocode.com/media/google-developers-new-project-step-2.png "Step 2")

After being redirected to the new app's page, click on "ENABLE APIS AND SERVICES". Find the Gmail API and go to it's page.

![Gmail API page.](https://gottocode.com/media/google-developers-new-project-step-3.png "Step 3")

When on the page, click "ENABLE" and then "Create credentials" on the next page (top, right corner).
On the text "If you wish you can skip this step and create an API key, client ID, or service account" click on "client ID". Google will redirect you to setting up the consent screen. What's typed on that screen doesn't matter for the purpose of this Docker image. When choosing "Application type" on the next screen, select "Other". After these two steps, Google will redirect to the "Credentials" screen for the app and show a popup with credentials which were just created.

![Google Credentials screen for an app.](https://gottocode.com/media/google-developers-new-project-step-4.png "Step 4")

Close it and instead download the credentials to a new and empty directory on your hard drive. Rename the file to "client_secret.json".

# Step 2: Obtain credentials from Google
Run `docker run -ti -v "$(pwd)":/service/configuration --rm playfulcorgi/gmail-filter node index`) inside of the directory with Google credentials. Go to the page displayed in the terminal and authorize the app with your Gmail account. Paste the returned code back to the terminal. The directory should now contain a subdirectory named credentials.

# Step 3: Create a file named from.txt
from.txt must contain a list of e-mail addresses. These e-mails don't need to be complete. For example, you can write only the domain part after @, for example "meetup.com", to capture more addresses.
```text
@someemailaddress1
@someemailaddress2
@someemailaddress3
```
Create such a file inside of the directory with "client_secret.json" and "credentials".

# Step 4: Create a label in Gmail and get its id
For the Docker image to know where to place incoming e-mails, create a new label. When done, run the following in the terminal while still inside of the directory with all the configuration files:
```bash
docker run -ti -v "$(pwd)":/service/configuration --rm playfulcorgi/gmail-filter node index ./labels
```
This command will list the ids of all the labels in Gmail. When it finishes, find the label you want to use and remember it.

# Step 5: Test the image locally
Run `docker run --rm -ti -v "$(pwd)":/service/configuration playfulcorgi/gmail-filter node index ./action <label id>`. The `<label id>` is the place to put the actual label id found in the previous step. If everything went fine, unread e-mails from sources listed inside from.txt should start disappearing from the inbox.

# Step 6: Run the image on a server.
To have the image run constantly in the background, run the following command:
```bash
docker run --rm --name my-gmail-filter -tid -v "$(pwd)":/service/configuration playfulcorgi/gmail-filter node index ./action <label id>`
```

The from.txt file can be replaced while the image is running and the image will pick up the changes.

![Image of a folder containing all the needed items for running the Docker image.](https://gottocode.com/media/google-developers-new-project-step-5.png "Final directory contents.")