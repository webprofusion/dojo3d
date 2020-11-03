# Dojo3D

An all-in-one library for 3D story telling, aimed at all ages of coder. No software installation required, useful for CoderDojo, Hour of Code activities etc.

![Example](screens/halloween.png)

# Example Library Usage

See the Happy Halloween example https://repl.it/@webprofusionchr/dojo3d-halloween

Jump straight to `Our main code for a simple story` to see the main story code.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Dojo 3D - Example Story Book</title>
    <script src="https://dojo3d.webprofusion.com/v1/dojo3d.js"></script>
    <link
      rel="stylesheet"
      href="https://dojo3d.webprofusion.com/v1/dojo3d.css"
    />
  </head>

  <body>
    <script>
      // create world
      var world = new dojo3d.World();
      var ui = dojo3d.UI;

      //fetch 3d models we can use, then do our main code
      world.fetchPrefabModels().then(async () => {
        // get the Happy Halloween scene model, add it to the scene at scale 0.1
        // https://sketchfab.com/JessSwynn; License: Creative Commons Attribution
        var scene = world.getPrefabModelByName("Happy Halloween");
        obj = await world.addSceneObject(scene, 0.1);

        //turn some lights on
        world.addLights();

        // define camera viewpoints so we can use them later
        var viewpoints = [
          { title: "ZoomedOut", position: { x: 0.0, y: 0.0, z: 5.0 } },
          { title: "House", position: { x: 0.059, y: 0.255, z: 1.099 } },
          { title: "Spider", position: { x: 0.05, y: 0.58, z: 0.424 } },
          { title: "BackHouse", position: { x: 0.041, y: 0.463, z: -1.731 } },
          {
            title: "BackUpstairs",
            position: { x: -0.066, y: 0.567, z: -0.438 },
          },
          { title: "Ghost", position: { x: -0.139, y: 0.142, z: -0.466 } },
          { title: "RIP", position: { x: -0.216, y: 0.005, z: 0.57 } },
          { title: "Cat", position: { x: -0.028, y: -0.071, z: 0.826 } },
        ];

        world.setViewpoints(viewpoints);

        /////////////////////////////////////////
        // Our main code for a simple story
        // animate to viewpoint named "ZoomedOut"
        await world.animateToViewpoint("ZoomedOut");

        // show intro message box at x:10,y:10
        ui.showMessage("Hello..", 10, 10);

        //wait a few seconds
        await ui.wait(3);

        // ask a question, answer will be "The option value", and answer.optionNumber is the option number selected starting at 1 (1,2,3 etc).
        let answer = await ui.ask("Why are your here?", [
          "I don't know.",
          "You sent for me.",
        ]);

        if (answer.optionNumber == 1) {
          ui.showMessage("Hmm, lost are we..");
        } else {
          ui.showMessage("Hmm, I don't remember doing that..");
        }

        // animate to viewpoint named "ZoomedOut"
        await world.animateToViewpoint("Cat");
      });
    </script>
  </body>
</html>
```

# Other Examples

[Low Poly Terrain Scene](https://repl.it/@webprofusionchr/amongyou)
![Among You](screens/amongyou.png)
