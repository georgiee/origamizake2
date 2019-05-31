## 30.05.2019
Sitting in my small office at home. It's a bank holiday today.
Wasted hours today to get Babylon + TS + yarn workspaces running. Many problems with paths and/or TS project references feature.
Then decided to use parcel in a single project to get things quickly running.

In the end Babylon stood in my way most of the time. I jsut wanted to create a basic structure to test and run some math.
I wanted to have an engien at hand to check the result but I'm still not happy.

Ditched everthing, now I try to implement myself the FOLD viewer. Based on SVG and looks easy. But it's written in coffee scripts
makes it hard to read. Let's see if I can implement the basic model "simple.fold"

## 31.05.2019
Sitting in the train to JSConf EUin Berlin.
Today I re-Implemeted the viewer from the [FOLD](https://github.com/edemaine/fold) by taking line after line from the compiled coffee script sources. It's a SVG markup build from a list of faces & vertices with a camera projection. The awesome things is the topological reordering derived from the faceOrders property in the fold file format. That way faces on the same plane are still drawn correctly. That's one of the main problems when rendering Origami in 3D space — so it's a great opportunity to get my hands on this.

Next steps are maybe:
+ Refactoring into a more reusable/functional structure
+ Derive an internal data format for the face/vertices data structure which I could utilize to create my own folding engine (the one I created in threejs earlier).

