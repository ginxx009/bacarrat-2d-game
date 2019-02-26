var engine: B2DGAME.Engine;

//The main entry point of the application
window.onload = function () {
    engine = new B2DGAME.Engine();
    engine.start();
}

window.onresize = function () {
    engine.resize();
}