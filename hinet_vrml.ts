// ===========================================================================
/*!
 * @brief Hi-net VRML Viewer
 * @author @MizunagiKB
 */
// -------------------------------------------------------------- reference(s)
/// <reference path="../DefinitelyTyped/jquery/jquery.d.ts"/>
/// <reference path="../DefinitelyTyped/bootstrap/bootstrap.d.ts"/>
/// <reference path="./DefinitelyTyped/hogan/hogan.d.ts"/>
/// <reference path="./DefinitelyTyped/threejs/detector.d.ts"/>
/// <reference path="./DefinitelyTyped/threejs/three.d.ts"/>

// ---------------------------------------------------------------- declare(s)

module hinet_vrml {

    const CAMERA_FOV: number = 60;
    const CAMERA_NEAR: number = 0.01;
    const CAMERA_FAR: number = 1024.0;
    const SCREEN_W: number = 1024.0;
    const SCREEN_H: number = 768.0;

    const CONTROL_SPEED_ROT: number = 5;
    const CONTROL_SPEED_ZOOM: number = 5;

    var camera: THREE.PerspectiveCamera = null;
    var controls: THREE.OrbitControls = null;
    var ambLight: THREE.AmbientLight = null;

    var root_scene: THREE.Scene = null;
    var data_scene: THREE.Scene = null;
    var renderer: THREE.WebGLRenderer = null;

    // ---------------------------------------------------------- interface(s)
    // --------------------------------------------------------------- enum(s)
    // ------------------------------------------------------ Global Object(s)
    // -------------------------------------------------------------- class(s)
    // ----------------------------------------------------------- function(s)
    // =======================================================================
    /*!
     *
     */
    function vrml_load(wrlpathname: string): void {
        let loader: any = new THREE.VRMLLoader();

        loader.load(wrlpathname, function(object: any) {
            root_scene.add(object);
        }
        );
    }

    export function set_scene(o:THREE.Scene):void{

        if(data_scene != null)
        {
            root_scene.remove(data_scene);
            data_scene = null;
        }

        if( o != null)
        {
            root_scene.add(o);
            data_scene = o;
        }
    }

    // =======================================================================
    /*!
     *
     */
    function init(): void {

        camera = new THREE.PerspectiveCamera(CAMERA_FOV, SCREEN_W / SCREEN_H, CAMERA_NEAR, CAMERA_FAR);
        camera.position.z = 8;

        controls = new THREE.OrbitControls(camera);
        controls.rotateSpeed = CONTROL_SPEED_ROT;
        controls.zoomSpeed = CONTROL_SPEED_ZOOM;
        //        controls.noZoom = false;
        //        controls.noPan = false;

        root_scene = new THREE.Scene();
        root_scene.add(camera);

        ambLight = new THREE.AmbientLight(0xFFFFFF);
        root_scene.add(ambLight);

        // renderer
        renderer = new THREE.WebGLRenderer({ antialias: false });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(SCREEN_W, SCREEN_H);

        let container = document.getElementById("main_surface");
        container.appendChild(renderer.domElement);
    }

    // =======================================================================
    /*!
     *
     */
    function animate(): void {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(root_scene, camera);
    }

    // =======================================================================
    /*!
     *
     */
    function evt_window_resize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

        //controls.handleResize();
    }

    // =======================================================================
    /*!
     *
     */
    export function main() {

        if (!Detector.webgl) {
            Detector.addGetWebGLMessage();
        }

        init();
        animate();

        //window.addEventListener("resize", evt_window_resize, false);
    }
}



// --------------------------------------------------------------------- [EOF]
