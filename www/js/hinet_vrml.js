/*!
 * @brief Hi-net VRML Viewer
 * @author @MizunagiKB
 */
var hinet_vrml;
(function (hinet_vrml) {
    var CAMERA_FOV = 60;
    var CAMERA_NEAR = 0.01;
    var CAMERA_FAR = 1024.0;
    var SCREEN_W = 640.0;
    var SCREEN_H = 480.0;
    var CONTROL_SPEED_ROT = 5;
    var CONTROL_SPEED_ZOOM = 5;
    var camera = null;
    var controls = null;
    var ambLight = null;
    var root_scene = null;
    var data_scene = null;
    var renderer = null;
    function vrml_load(wrlpathname) {
        var loader = new THREE.VRMLLoader();
        loader.load(wrlpathname, function (object) {
            root_scene.add(object);
        });
    }
    function set_scene(o) {
        if (data_scene != null) {
            root_scene.remove(data_scene);
            data_scene = null;
        }
        if (o != null) {
            root_scene.add(o);
            data_scene = o;
        }
    }
    hinet_vrml.set_scene = set_scene;
    function init() {
        camera = new THREE.PerspectiveCamera(CAMERA_FOV, SCREEN_W / SCREEN_H, CAMERA_NEAR, CAMERA_FAR);
        camera.position.z = 8;
        controls = new THREE.OrbitControls(camera);
        controls.rotateSpeed = CONTROL_SPEED_ROT;
        controls.zoomSpeed = CONTROL_SPEED_ZOOM;
        root_scene = new THREE.Scene();
        root_scene.add(camera);
        ambLight = new THREE.AmbientLight(0xFFFFFF);
        root_scene.add(ambLight);
        renderer = new THREE.WebGLRenderer({ antialias: false });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(SCREEN_W, SCREEN_H);
        var container = document.getElementById("main_surface");
        container.appendChild(renderer.domElement);
    }
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(root_scene, camera);
    }
    function evt_window_resize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    function main() {
        if (!Detector.webgl) {
            Detector.addGetWebGLMessage();
        }
        init();
        animate();
    }
    hinet_vrml.main = main;
})(hinet_vrml || (hinet_vrml = {}));
//# sourceMappingURL=hinet_vrml.js.map