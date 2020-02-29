import * as THREE from 'three'
import glb from './tic_tac_toe.glb';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

/**
 * The view class
 */
export class World {
    private METERS_IN_INCH: number = .0254;
    private pieces_on_board: THREE.Mesh[] = [];
    private x_piece: THREE.Mesh;
    private y_piece: THREE.Mesh;
    private o_piece: THREE.Mesh;
    private camera: THREE.PerspectiveCamera;
    private scene: THREE.Scene;

    private renderer: THREE.WebGLRenderer;
    private raycaster: THREE.Raycaster;
    private canvasDiv: HTMLDivElement;

    constructor() {
        let loader = new GLTFLoader();
        let dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('decoder/');
        loader.setDRACOLoader(dracoLoader);
        this.renderer = new THREE.WebGLRenderer();
        this.canvasDiv = <HTMLDivElement>document.getElementById("canvas-div");
        this.renderer.setSize(this.canvasDiv.clientWidth, this.canvasDiv.clientHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.physicallyCorrectLights = true;
        this.canvasDiv.appendChild(this.renderer.domElement);
        this.raycaster = new THREE.Raycaster();

        // setup the glb loader callback
        loader.load(glb, gltf => this.loadGlb(gltf), undefined, function (error) {
            console.error(error);
        });

        // setup window resize callback
        window.addEventListener('resize', ev => this.onWindowResize(ev), false);
    }

    private loadGlb(gltf: GLTF) {
        console.log('Number of cameras: ' + gltf.cameras.length);
        console.log('Number of scenes: ' + gltf.scenes.length);
        console.log('Number of animations: ' + gltf.animations.length);
        console.log('Scene: ' + gltf.scene.name);
        console.log('Scene has ' + gltf.scene.children.length + ' children');
        gltf.scene.children.forEach(child => {
            if (child.name == "x-piece" && child instanceof THREE.Mesh) {
                this.x_piece = child;
            }
            if (child.name == "y-piece" && child instanceof THREE.Mesh) {
                this.y_piece = child;
            }
            if (child.name == "o-piece" && child instanceof THREE.Mesh) {
                this.o_piece = child;
            }
        });
        gltf.scene.remove(this.x_piece);
        gltf.scene.remove(this.y_piece);
        gltf.scene.remove(this.o_piece);

        this.scene = gltf.scene;
        this.camera = <THREE.PerspectiveCamera>gltf.cameras[0];
        this.camera.aspect = this.canvasDiv.clientWidth / this.canvasDiv.clientHeight;
        this.camera.updateProjectionMatrix();
        console.log('camera fov: ' + this.camera.fov);

        this.animate();
    }

    private animate(): void {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }

    public getNumPieces(): number {
        return this.pieces_on_board.length;
    }

    public getCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }

    public getScene(): THREE.Scene {
        return this.scene;
    }

    public removeAllSpawnedPieces() {
        this.pieces_on_board.forEach(spanedPiece => {
            this.scene.remove(spanedPiece);
        });
        while (this.pieces_on_board.length > 0) {
            this.pieces_on_board.pop();
        }
    }

    public spawnPieceAt(piece: Pieces, position: THREE.Vector2) {
        let spawnPoint = new THREE.Vector3();
        spawnPoint.x = -4 + (4 * position.x);
        spawnPoint.y = -5 + (4 * position.y);
        spawnPoint.z = 2;
        spawnPoint = this.convertInchesToMeters(spawnPoint);

        switch (piece) {
            case Pieces.X:
                let x_mesh = this.spawnMeshFrom(this.x_piece);
                x_mesh.name = "x-piece" + this.pieces_on_board.length.toString();
                x_mesh.position.set(spawnPoint.x, spawnPoint.y, spawnPoint.z);
                this.pieces_on_board.push(x_mesh);
                this.scene.add(x_mesh);
                break;
            case Pieces.Y:
                let y_mesh = this.spawnMeshFrom(this.y_piece);
                y_mesh.name = "y-piece" + this.pieces_on_board.length.toString();
                y_mesh.position.set(spawnPoint.x, spawnPoint.y, spawnPoint.z);
                this.pieces_on_board.push(y_mesh);
                this.scene.add(y_mesh);
                break;
            case Pieces.O:
                let o_mesh = this.spawnMeshFrom(this.o_piece);
                o_mesh.name = "o-piece" + this.pieces_on_board.length.toString();
                o_mesh.position.set(spawnPoint.x, spawnPoint.y, spawnPoint.z);
                this.pieces_on_board.push(o_mesh);
                this.scene.add(o_mesh);
                break;
            default:
                console.error("A valid piece was not passed");
        }
        console.log("Spawned " + Pieces[piece] + " at (" + position.x + ", " + position.y + ")");
    }

    private convertInchesToMeters(inches: THREE.Vector3): THREE.Vector3 {
        return new THREE.Vector3(inches.x * this.METERS_IN_INCH, inches.y * this.METERS_IN_INCH, inches.z * this.METERS_IN_INCH);
    }

    private spawnMeshFrom(mesh: THREE.Mesh): THREE.Mesh {
        let retval = new THREE.Mesh(mesh.geometry, mesh.material);
        retval.scale.set(mesh.scale.x, mesh.scale.y, mesh.scale.z);
        retval.rotation.set(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z);
        return retval;
    }

    /**
     * This function translates mouse coordinates into the corresponding tic tac toe board location where the board is represented as a
     * 3x3 matrix where the bottom left corner is [0][0], the top right corner is [2][2], and the bottom right corner is [2][0].  Return
     * values will therefore be between [0,2] for both x and y.
     * 
     * @param mouseCoords normalized mouse coordinates (i.e. -1 to 1)
     * @returns the board position as an (x,y) vector representing [x][y]
     */
    public getBoardPositionFrom(mouseCoords: THREE.Vector2): THREE.Vector2 {
        this.raycaster.setFromCamera(mouseCoords, this.camera);
        let intersects = this.raycaster.intersectObjects(this.scene.children);
        let debugStr = "Listing out all elements in scene:\n";
        for (let i = 0; i < this.scene.children.length; i++) {
            debugStr += "\t" + this.scene.children[i].name + "\n";
        }
        console.log(debugStr);
        let boardPosition = undefined;
        console.log("Intersected " + intersects.length + " objects:");
        for (let i = 0; i < intersects.length; i++) {
            console.log("\t" + intersects[i].object.name + " at (" + intersects[i].point.x / this.METERS_IN_INCH + ", " +
                intersects[i].point.y / this.METERS_IN_INCH + ", " + intersects[i].point.z / this.METERS_IN_INCH + ")");
        }
        if (intersects.length > 0 && intersects[0].object.name == "Board") {
            let interObj = intersects[0].object;
            boardPosition = this.convertCoordinateToBoardPosition(intersects[0].uv);
        }
        if (!boardPosition) {
            //     console.log("Returning board position (" + boardPosition.x + ", " + boardPosition.y + ")");
            // }
            // else {
            console.log("No board position found");
        }
        return boardPosition;
    }

    private onWindowResize(event: UIEvent) {
        if (this.camera && this.camera.type == "PerspectiveCamera") {
            this.camera.aspect = this.canvasDiv.clientWidth / this.canvasDiv.clientHeight;
            this.camera.updateProjectionMatrix();
        }

        this.renderer.setSize(this.canvasDiv.clientWidth, this.canvasDiv.clientHeight);
    }

    private convertCoordinateToBoardPosition(coords: THREE.Vector2): THREE.Vector2 {
        let retval = new THREE.Vector2();
        if (coords.x < .333) {
            retval.x = 2;
        }
        else if (coords.x > .666) {
            retval.x = 0;
        }
        else {
            retval.x = 1;
        }
        if (coords.y < .333) {
            retval.y = 0;
        }
        else if (coords.y > .666) {
            retval.y = 2;
        }
        else {
            retval.y = 1;
        }
        return retval;
    }
}

export enum Pieces {
    X = 1,
    Y,
    O
}