Live Template Installer
=======================

A command line tool for managing your Webstorm / Intellij IDEA live templates. It is intended to sync to a git for easy distribution and backup of templates.

**NOTE:** It's a good idea to shutdown Webstorm / Intellij before running any of these commands.

Install via npm:
----------------
```
npm install -g live-template-installer
```

Prepare a git repo with your intended templates:
------------------------------------------------
I will be using [this repo](https://github.com/jamestalmage/angularjs-webstorm-livetpls) as an example. Your repo will need to have a file called [live_template_registry.json](https://github.com/jamestalmage/angularjs-webstorm-livetpls/blob/master/live_template_registry.json) that details the templates you want to sync. This utility offers two way syncing between a git repo and your Intellij templates directories, so it's preferable that you fork any 3rd party repos so that you can push modifications back to your own fork.

Clone the repo and install the templates:
-----------------------------------------
```
git clone git@github.com:jamestalmage/angularjs-webstorm-livetpls.git
cd angularjs-webstorm-livetpls
live-templates install
```
This will walk you through a series of steps. It should find all the Webstorm/Intellij installations for your profile, and allow you to install a subset of the files.

Back your templates up to a repo:
---------------------------------
```
cd angularjs-webstorm-livetpls
live-templates backup
```
This will copy files out of your template directory back into the repo. It trims out any `false` context options, leaving only the true ones: `<option name="JAVA_SCRIPT" value="true" />`. The `false` options are unnecessary (the templates will still work), eliminating them greatly cuts down on the diff created when you update the repo with the updated templates.