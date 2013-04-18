## Creative Notes
=================

### Installing

Currently, Creative Notes can be run in two ways:

1. Using Webinos PZP webserver.
2. Using Webinos Widget Renderer Tool (WRT). 

Installation with WRT is trivial, but if you want a complete Creative Notes experience, you have to use the Webinos PZP webserver. At this time, WRT mode in Android does not allow adding files to notes. You can use any of these ways on every device.

Note that every device must be configurated (webinos configurated) under the same Google/Yahoo account to be in the same group of notes.

In every case, first of all, make sure you are running a working Webinos-Platform and the PZP is started and configurated.

#### Using WRT
##### Windows, Mac OS X, Linux

1. Download CreativeNotes.wgt from the root folder in this Git repository.
2. Just double click the downloaded file.

##### Android

1. Run Webinos Applications and choose either Megastore (and download Creative Notes) or Scan SD Card. CreativeNotes.wgt must be transferred to the smartphone/tablet if the Scan SD Card was chosen. 
2. Creative Notes must be in the Webinos applications list.

#### Using PZP webserver
##### Windows, Mac OS X, Linux

1. Clone the Creative Notes repository by running:
"git clone https://github.com/webinos/app-CreativeNotes.git"
2. Copy CreativeNotes folder in *<webinos_platform>/webinos/web_root* or *<webinos_platform>/webinos/test* depending on your webinos installation.
3. Browse *http://localhost:8080/CreativeNotes/index.html* from a websocket enabled browser.

##### Android (requires root)
1. Clone the Creative Notes repository by running:
"git clone https://github.com/webinos/app-CreativeNotes.git"
2. Copy CreativeNotes folder in */data/data/org.webinos.app/node_modules/webinos/wp4/webinos/test*
3. Browse *http://localhost:8080/CreativeNotes/index.html* from a websocket enabled browser (like Chrome or Firefox, NOT de default browser).

NOTE: To copy CreativeNotes folder in /data/data/... may be useful [Root Explorer](https://play.google.com/store/apps/details?id=com.speedsoftware.rootexplorer)

### Use

Once everything is set, notes can be created and updated and everything will be in sync between devices. When running on an Android device in PZP webserver mode, photos can be made in real time and will be instantly shown. In the rest of OS (in both modes), the attachments will be made selecting files. Finally, when running Creative Notes under Android WRT, attachments are not possible at the moment. In this mode you can view the note and add text, but not images or photos.