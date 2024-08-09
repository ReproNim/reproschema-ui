# reproschema-ui

![CI](https://github.com/ReproNim/reproschema-ui/workflows/CI/badge.svg)

This repository contains the code for the user-interface for the [ReproSchema](https://github.com/ReproNim/reproschema).

See it in action [HERE](https://www.repronim.org/reproschema-ui/)

<!-- TOC -->

- [reproschema-ui](#reproschema-ui)
  - [List of supported input types](#list-of-supported-input-types)
    - [Text inputs](#text-inputs)
    - [Numerical values](#numerical-values)
    - [Audio inputs](#audio-inputs)
    - [Time and dates inputs](#time-and-dates-inputs)
    - [Multiple options inputs](#multiple-options-inputs)
    - [Others](#others)
  - [Viewing an certain protocol or activity with the app](#viewing-an-certain-protocol-or-activity-with-the-app)
  - [Reference material](#reference-material)
    - [App architecture](#app-architecture)
  - [Serve the app on your computer](#serve-the-app-on-your-computer)
    - [Install the dependencies](#install-the-dependencies)
    - [Serve the app locally](#serve-the-app-locally)
    - [Build for production with minification](#build-for-production-with-minification)
    - [Build for production and view the bundle analyzer report](#build-for-production-and-view-the-bundle-analyzer-report)
    - [Run unit tests](#run-unit-tests)
    - [Run e2e tests](#run-e2e-tests)
    - [Run all tests](#run-all-tests)

<!-- /TOC -->

## List of supported input types

The `inputType` is checked by `src/components/InputSelector/InputSelector.vue`
which then calls the appropriate component.

Most of them are in the folder `src/components/Inputs/`

One exception is :
-   sign: `src/components/StudySign.StudySign.vue`

### Text inputs

-   text: `WebTextInput/TextInput.vue`
-   multitext: `MultiTextInput/MultiTextInput.vue`
-   email: `EmailInput/EmailInput.vue`

### Numerical values

-   number: `WebIntegerInput/IntegerInput.vue`
-   float:  `WebFloatInput/FloatInput.vue`

### Audio inputs

-   audioCheck: `AudioCheck/AudioCheck.vue`
-   audioRecord: `WebAudioRecord/Audio.vue`
-   audioPassageRecord: `WebAudioRecord/Audio.vue`
-   audioImageRecord: `WebAudioRecord/Audio.vue`
-   audioRecordNumberTask: `WebAudioRecord/Audio.vue`
-   audioAutoRecord: `AudioCheckRecord/AudioCheckRecord.vue`

### Time and dates inputs

-   date: `YearInput/YearInput.vue`
-   year: `YearInput/YearInput.vue`
-   timeRange: `TimeRange/TimeRange.vue`

### Multiple options inputs

-   radio: `WebRadio/Radio.vue`
-   select: `SelectInput/SelectInput.vue`
-   selectLanguage: `SelectInput/SelectInput.vue`
-   selectCountry: `SelectInput/SelectInput.vue`
-   selectState: `SelectInput/SelectInput.vue`

### Others

-   slider: `SliderInput/SliderInput.vue`
-   documentUpload: `DocumentUpload/DocumentUpload.vue`
-   save: `SaveData/SaveData.vue`
-   static: `Static/Static.vue`
-   StaticReadOnly: `Static/Static.vue`


## Viewing an certain protocol or activity with the app

If you just want to view a protocol using the `reproschema-ui` you can pass the
URL of the protocol schema to the `url` query parameter like this:

```https://www.repronim.org/reproschema-ui/#/?url=url-to-your-protocol_schema```

If you are hosting a schema on github, make sure that you are passing the URL of
the **raw** content of the protocol schema. For example, our demo protocol can be
accessed at this URL:

[https://github.com/ReproNim/demo-protocol/blob/master/VoicePilot/VoicePilot_schema](https://github.com/ReproNim/demo-protocol/blob/master/VoicePilot/VoicePilot_schema)

But to get access to the raw content of that file you must click on the `Raw`
button that will open this URL:

[https://raw.githubusercontent.com/ReproNim/demo-protocol/master/VoicePilot/VoicePilot_schema](https://raw.githubusercontent.com/ReproNim/demo-protocol/master/VoicePilot/VoicePilot_schema).

Similarly, to view a single activity you can simply do this:

```https://www.repronim.org/reproschema-ui/#/activities/0?url=url-to-activity-schema```

When you want to make a standalone app for your study / protocol, you should
modify the URL next to `githubSrc` in the file `src/config.js` to make it point
to the URL of your schema. If you are using GitHub it should point to the raw
Github pointer.

Also make sure that assetsPublicPath and backendServer are pointing the correct things.

```javascript
module.exports = {
  /* eslint-disable */
  githubSrc: 'url-to-your-protocol_schema',
  banner: 'This service is a demonstration for the ReproNim project.',
  startButton: 'Join',
  assetsPublicPath: '/reproschema-ui/',
  backendServer: 'https://sig.mit.edu/vb/'
};
```


## Reference material

This app use [Vue.js](https://vuejs.org/), a javascript framework.

Working on this will most likely require you to have some knowledge of HTML, CSS
and javascript.

For some free introductory material to javascript you can check the [mozilla MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
or the [W3 school](https://www.w3schools.com/js/default.asp).

For introductory material on Vue you can start by having a look at the [guide](https://vuejs.org/v2/guide/).
For a more detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/)
and [docs for vue-loader](http://vuejs.github.io/vue-loader).

You can also find many non-free courses for all of the above on [udemy](https://www.udemy.com/)
or similar MOOC services.

### App architecture

![app architecture](docs/img/app_architecture.jpeg)

## Serve the app on your computer

If you want help us improve the app and work on it on your computer, you will
need to [fork this repository](https://help.github.com/en/github/getting-started-with-github/fork-a-repo)
and [clone it](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository)
on your machine.

If you don't have node or are not familiar with it, the easiest option is to 
use a Docker setup.

```shell
docker run -it --rm -p 8080:8080 -v $(pwd):/src --entrypoint bash \
    --platform linux/amd64 node:21.7.2-bookworm-slim
```

In the container terminal

```shell
cd /src
npm install
npm run serve
```

This serves the app with hot reload at `localhost:8080`: in other words you will
be able to see the app run if you open a browser and go to this URL
[localhost:8080](localhost:8080).

### Build for production with minification
``` bash
npm run build
```

### Build for production and view the bundle analyzer report
``` bash
npm run build --report
```

### Run unit tests
``` bash
npm run test:unit
```

### Run e2e tests
``` bash
npm run test:e2e
```

### Run all tests
``` bash
npm test
```

### Lints and fixes files
``` bash
npm run lint
```

## To test protocols and schemas locally

Run this cors server script in the root directory of your reproschema. For
example, if you clone the demo-protocol, run the script inside the cloned 
directory. This script will serve the tree locally.

```python
#!/usr/bin/env python3

# It's python3 -m http.server PORT for a CORS world

from http.server import HTTPServer, SimpleHTTPRequestHandler
import sys

class CORSRequestHandler(SimpleHTTPRequestHandler):

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        return super(CORSRequestHandler, self).end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

host = sys.argv[1] if len(sys.argv) > 2 else '0.0.0.0'
port = int(sys.argv[len(sys.argv)-1]) if len(sys.argv) > 1 else 8000

print("Listening on {}:{}".format(host, port))
httpd = HTTPServer((host, port), CORSRequestHandler)
httpd.serve_forever()
```

Change config.js in this ui repo to point to your local schema. For example,
if you cloned the demo protocol it would look like this:

```
  githubSrc: 'http://localhost:8000/DemoProtocol/DemoProtocol_schema',
```



