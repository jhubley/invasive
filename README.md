# Invasive Ricochet

Invasive Ricochet explores how invasive plant species affect Bay Area ecosystems. Focusing on a select number of case studies, I have created narratives of the struggle between native plants and the invasive plants that are displacing them.

It was developed over the summer of 2015 while I was a Creative Code Fellow at the Gray Area Foundation for the Arts and was installed at Gray Area in August. This repo includes Arduino code used for capacitive touch sensors. There's also some node.js written to translate the onscreen data to LEDs (higher species occurence = brighter lights) via websocket. This didn't end up getting used at the installation in August. 

To run this project with touch, you'll need an Arduino Leonardo with an MPR 121 capacitive touch shield, some alligator clips, and some invasive plants. You'll also need the Arduino IDE installed, as well as Node. Solder the shield to the Arduino, clip alligator clips to sensor points #0, #2, #9, and #11 on the shield, clip the other ends to the plants, and plug in the Arduino to the USB port on your computer. Put the invasivericochet.ino file in a folder called invasivericochet within your Arduino documents folder, and upload the code. Then run 'node app.js' via the command line.

To run this project on the web, just use the /public folder and comment out references to socket.io

It can also be viewed at invasivericochet.com