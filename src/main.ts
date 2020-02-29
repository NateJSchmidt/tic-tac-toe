// class TimerTest {
//     private num: number;
//     private data: SomeOtherDataContainer;
    
//     constructor(inData: SomeOtherDataContainer) {
//         this.num = 5;
//         this.data = inData;
//     }

//     public setTimer(milliseconds: number) {
//         setTimeout(()=>this.timerCallback(), milliseconds);
//     }

//     private timerCallback() {
//         console.log("Timer fired and num = " + this.num + ". Also, other data is " + this.data.getNum());
//     }
// }

// class SomeOtherDataContainer {
//     private myNum: number;

//     constructor(num: number) {
//         this.myNum = num;
//     }

//     public getNum(): number {
//         return this.myNum;
//     }
// }

// let data = new SomeOtherDataContainer(10);
// let t = new TimerTest(data);
// t.setTimer(2000);



import { World } from './World';
import { Controller } from './Controller';
import { GameLogic } from './GameLogic';

let world = new World();
let game = new GameLogic();
let controller = new Controller(world, game);


// document.addEventListener('mousemove', onMouseMove, false);

// function onMouseMove(event: MouseEvent): void {
//     event.preventDefault();
//     let mouseCoords = normalizeWindowCoordinates(new Vector2(event.clientX, event.clientY));
//     raycaster.setFromCamera(mouseCoords, world.getCamera());
//     let intersected_objects = raycaster.intersectObjects(world.getScene().children);
//     if(intersected_objects.length > 0 && intersected_objects[0].object.name == "Board")
//     {
//         let boardPosition = world.convertCoordinateToBoardPosition(mouseCoords);
//     }
// }
