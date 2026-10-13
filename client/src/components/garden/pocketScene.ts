import * as THREE from "three";
import { MOOD_PLANTS, VISIBLE_PLANT_LIMIT, type Mood } from "../../../../shared/moods.js";

export type PocketView = "friend" | "toy" | "garden";
export type PocketAction = "wave" | "water" | "turn" | "celebrate";
export type PocketScene = {
  view: (view: PocketView) => void;
  act: (action: PocketAction) => void;
  moods: (moods: Mood[]) => void;
  customize: (tint:"moss"|"rose"|"lavender", accessory:"leaves"|"mushroom"|"flower") => void;
  dispose: () => void;
};

// Local geometry: no external scene, texture requests, account or paid assets.
export function createPocketScene(host: HTMLElement, onAction: (action: PocketAction) => void): PocketScene {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-2.8, 2.8, 2.25, -2.25, .1, 30);
  camera.position.set(0, 1.15, 7);
  camera.lookAt(0, .65, 0);
  scene.add(new THREE.HemisphereLight(0xfff9e9, 0xb2a593, 1.25));
  const sun = new THREE.DirectionalLight(0xffefd9, 2.5);
  sun.position.set(-3, 5, 5);
  sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-3,right:3,top:3,bottom:-3,near:.1,far:20});
  sun.shadow.normalBias=.015;sun.shadow.bias=-.0001;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xf3dce2, .65);
  fill.position.set(3, 1, -2);
  scene.add(fill);
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const color = (hex: number) => {
    const material = new THREE.MeshStandardMaterial({ color: hex, roughness: .68 });
    materials.add(material);
    return material;
  };
  const sage = color(0x91ac75), green = color(0x506c42), cream = color(0xf4e6bf);
  const pink = color(0xdfa8b5), clay = color(0xd5ac8b), soil = color(0x887653);
  const dark = color(0x344433), yellow = color(0xf0d88f), lilac = color(0xb9a4cc);
  const skin=color(0x91ac75), shell=color(0x91ac75);
  const face=color(0xf1cfa5), leather=color(0x9e714b), boot=color(0x53674c);
  const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D,
    position: [number, number, number], scale: [number, number, number] = [1, 1, 1]) => {
    geometries.add(geometry);
    const item = new THREE.Mesh(geometry, material);
    item.position.set(...position);
    item.scale.set(...scale);
    parent.add(item);
    return item;
  };
  const ball = (parent: THREE.Object3D, material: THREE.Material,
    position: [number, number, number], scale: [number, number, number]) =>
    mesh(new THREE.SphereGeometry(1, 24, 16), material, parent, position, scale);
  const cylinder = (parent: THREE.Object3D, material: THREE.Material,
    top: number, bottom: number, height: number, position: [number, number, number]) =>
    mesh(new THREE.CylinderGeometry(top, bottom, height, 32), material, parent, position);
  const rounded = (width: number, height: number, depth: number, radius = .15) => {
    const shape = new THREE.Shape();
    const x = -width / 2, y = -height / 2;
    shape.moveTo(x + radius, y);
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + height - radius);
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    shape.lineTo(x + radius, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth, bevelEnabled: true, bevelSegments: 3, steps: 1,
      bevelSize: .04, bevelThickness: .04, curveSegments: 12,
    });
    return geometry;
  };
  const buddies: { root: THREE.Group; arm: THREE.Group; head: THREE.Group; wrist: THREE.Group; eyes: THREE.Mesh[] }[] = [];
  const buddy = (parent: THREE.Object3D) => {
    const root=new THREE.Group();parent.add(root);
    const blue=color(0x70aac5), navy=color(0x3a4676), leafGreen=color(0x94b94a);
    const shirt=color(0xf5edcd), shoe=color(0x82ac9b), skinTone=color(0xf2c99d);
    const hair=color(0x414b79), gold=color(0xe9c35f);
    // Profile surfaces let cheeks, jaw, cloth and leather have intentional silhouettes.
    const sculpt=(profiles:number[][],power=2,folds=0,facial=false)=>{
      const vertices:number[]=[],indices:number[]=[],vertexColors:number[]=[];
      const curve=new THREE.CatmullRomCurve3(profiles.map(p=>new THREE.Vector3(p[1],p[0],p[2])),false,'catmullrom',.25);
      const rings=64,sides=64;
      for(let r=0;r<=rings;r++){
        const t=r/rings,point=curve.getPoint(t);
        for(let i=0;i<=sides;i++){
          const a=i/sides*Math.PI*2,c=Math.cos(a),sn=Math.sin(a);
          const x=Math.sign(sn)*Math.pow(Math.abs(sn),2/power)*Math.max(.001,point.x);
          let z=Math.sign(c)*Math.pow(Math.abs(c),2/power)*Math.max(.001,point.z);
          z+=folds*Math.sin(a*9+point.y*19)*Math.sin(Math.PI*t);
          if(facial&&c>0){
            z+=.046*Math.exp(-((x/.065)**2+((point.y-.965)/.12)**2));
            z-=.012*Math.exp(-((x/.12)**2+((point.y-.835)/.038)**2));
          }
          vertices.push(x,point.y,z);
          const blush=facial&&c>0?.27*Math.exp(-(((Math.abs(x)-.26)/.09)**2+((point.y-.89)/.07)**2)):0;
          const tone=new THREE.Color(0xffffff).lerp(new THREE.Color(0xe89788),blush);
          vertexColors.push(tone.r,tone.g,tone.b);
          if(r<rings&&i<sides){const k=r*(sides+1)+i;indices.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1);}
        }
      }
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(vertexColors,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
    };
    const stitch=(group:THREE.Object3D,points:[number,number,number][],material:THREE.Material,radius=.004)=>
      mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),24,radius,6,false),material,group,[0,0,0]);
    shirt.roughness=.95;navy.roughness=.9;leather.roughness=.78;shoe.roughness=.78;skinTone.roughness=.56;const faceSurface=skinTone.clone();faceSurface.vertexColors=true;materials.add(faceSurface);
    const limb=(group:THREE.Object3D,material:THREE.Material,a:[number,number,number],b:[number,number,number],radius:number)=>{
      const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),direction=to.clone().sub(from);
      const length=direction.length();
      const shape=sculpt([[-length/2,radius*.72,radius*.72],[-length*.38,radius,radius],[length*.3,radius*.92,radius*.92],[length/2,radius*.72,radius*.72]],2.4);
      const part=mesh(shape,material,group,from.clone().add(to).multiplyScalar(.5).toArray() as [number,number,number]);
      part.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());return part;
    };
    const leafGeometry=()=>{
      const shape=new THREE.Shape();shape.moveTo(0,0);shape.bezierCurveTo(-.23,.16,-.25,.48,0,.7);shape.bezierCurveTo(.25,.48,.23,.16,0,0);
      return new THREE.ExtrudeGeometry(shape,{depth:.025,bevelEnabled:true,bevelSize:.012,bevelThickness:.01,bevelSegments:2,steps:1});
    };
    mesh(sculpt([[.67,.14,.15],[.79,.35,.28],[1.05,.47,.34],[1.29,.38,.28],[1.44,.08,.06]],2.2),hair,root,[0,0,-.085]);
    mesh(sculpt([[.59,.025,.018],[.66,.18,.16],[.77,.30,.265],[.9,.395,.315],[1.04,.42,.32],[1.2,.395,.29],[1.36,.28,.22],[1.42,.012,.012]],2,0,true),faceSurface,root,[0,0,.06]);
    const earShape=new THREE.Shape();earShape.moveTo(0,-.1);earShape.quadraticCurveTo(.25,-.02,.32,.18);earShape.quadraticCurveTo(.04,.12,0,.08);
    for(const side of [-1,1]){
      const ear=mesh(new THREE.ExtrudeGeometry(earShape,{depth:.08,bevelEnabled:true,bevelSize:.025,bevelThickness:.02,bevelSegments:3,steps:1}),skinTone,root,[side*.37,.96,-.04]);ear.scale.set(side*.78,.78,.9);
      const inner=ball(root,pink,[side*.45,1.01,.06],[.045,.018,.012]);inner.rotation.z=side*.4;
    }
    const eyes=[-.17,.17].map(x=>ball(root,dark,[x,.98,.356],[.028,.049,.012]));
    eyes.forEach(eye=>{eye.userData.restEye=.049;});
    for(const x of [-.17,.17])ball(root,shirt,[x-.007,1.003,.369],[.009,.012,.006]);
    // Blush is blended into the skin vertices, rather than separate cheek disks.
    stitch(root,[[-.045,.855,.388],[0,.844,.395],[.045,.855,.388]],leather,.004);
    for(const side of [-1,1])stitch(root,[[side*.12,1.075,.37],[side*.165,1.085,.358],[side*.205,1.075,.335]],hair,.007);
    // A scalloped bluebell, modelled as a curved surface rather than a stack of spheres.
    const positions:number[]=[],colors:number[]=[],indices:number[]=[];const around=128,rows=40;
    for(let row=0;row<=rows;row++)for(let i=0;i<=around;i++){
      const t=row/rows,a=i/around*Math.PI*2,r=.055+.48*Math.pow(t,1.1);
      positions.push(Math.sin(a)*r,1.64-t*.48-(.5+.5*Math.cos(a*6))*.14*Math.pow(t,8),Math.cos(a)*r);
      const c=new THREE.Color().lerpColors(new THREE.Color(0x81b4a3),new THREE.Color(0x66a9c8),t);
      c.multiplyScalar(.92+.08*Math.cos(a*6));colors.push(c.r,c.g,c.b);
      if(row<rows&&i<around){const p=row*(around+1)+i;indices.push(p,p+around+1,p+1,p+1,p+around+1,p+around+2);}
    }
    const bell=new THREE.BufferGeometry();bell.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));bell.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));bell.setIndex(indices);bell.computeVertexNormals();
    const bellMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,side:THREE.DoubleSide});materials.add(bellMaterial);mesh(bell,bellMaterial,root,[0,0,0]);
    // One continuous curved flower surface avoids overlapping flat petal pieces.
    const stemCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,1.61,0),new THREE.Vector3(.06,1.79,0),new THREE.Vector3(.14,1.89,-.03)]);
    mesh(new THREE.TubeGeometry(stemCurve,12,.035,8,false),green,root,[0,0,0]);
    for(let i=0;i<4;i++){const a=i/4*Math.PI*2;const calyx=mesh(leafGeometry(),leafGreen,root,[Math.sin(a)*.035,1.58,Math.cos(a)*.035],[.33,.33,1]);calyx.rotation.z=Math.PI;calyx.rotation.y=a;}
    const head=new THREE.Group();head.position.set(0,.65,0);
    for(const part of [...root.children]){root.remove(part);part.position.y-=.65;head.add(part);}
    head.scale.set(.88,1,.88);root.add(head);
    eyes.forEach(eye=>{eye.userData.restX=eye.position.x;});
    // Cream blouse, leafy neck scarf, navy shorts, socks and rounded green shoes.
    mesh(sculpt([[.09,.23,.15],[.16,.27,.16],[.34,.255,.155],[.49,.29,.16],[.57,.24,.135],[.64,.09,.07]],3,.008),shirt,root,[0,0,0]);
    stitch(root,[[-.24,.13,.145],[0,.115,.17],[.24,.13,.145]],cream,.006);
    stitch(root,[[0,.57,.15],[0,.4,.163],[0,.2,.175]],cream,.003);
    for(const y of [.26,.36,.46])mesh(new THREE.CylinderGeometry(.013,.013,.006,12),cream,root,[0,y,.182]).rotation.x=Math.PI/2;
    mesh(sculpt([[-.08,.23,.15],[.02,.3,.185],[.13,.27,.165],[.16,.24,.15]],3,.006),navy,root,[0,0,0]);
    for(const side of [-1,1]){
      mesh(sculpt([[-.18,.11,.14],[-.13,.13,.155],[0,.145,.15],[.08,.12,.13]],3,.004),navy,root,[side*.16,0,0]);
      stitch(root,[[side*.07,.035,.17],[side*.14,-.07,.16],[side*.23,-.16,.145]],blue,.003);
    }
    for(const [x,angle] of [[-.16,.7],[.16,-.7],[0,Math.PI]]){const collar=mesh(leafGeometry(),leafGreen,root,[x,.62,.19],[.53,.4,1]);collar.rotation.z=angle;}
    cylinder(root,skinTone,.072,.072,.26,[0,.66,0]);
    const arm=new THREE.Group();arm.position.set(-.27,.55,0);root.add(arm);
    const sleeve=limb(arm,shirt,[0,0,0],[-.16,-.12,0],.115);
    limb(arm,blue,[-.15,-.1,0],[-.17,-.14,0],.12);
    limb(arm,skinTone,[-.17,-.14,0],[-.38,-.25,.04],.058);
    const handStart=arm.children.length;
    mesh(sculpt([[-.055,.01,.012],[-.035,.07,.038],[.025,.077,.042],[.055,.035,.025]],3),skinTone,arm,[-.43,-.26,.05]).rotation.z=1.5;
    for(let i=0;i<3;i++)limb(arm,skinTone,[-.47,-.24-i*.02,.05],[-.55,-.23-i*.022,.055],.014);
    const wrist=new THREE.Group();wrist.position.set(-.4,-.25,.05);
    for(const part of [...arm.children].slice(handStart)){arm.remove(part);part.position.sub(wrist.position);wrist.add(part);}arm.add(wrist);
    limb(root,shirt,[.26,.56,0],[.36,.35,0],.115);limb(root,blue,[.34,.39,0],[.37,.34,0],.12);
    limb(root,skinTone,[.37,.34,0],[.43,.55,.18],.06);mesh(sculpt([[-.075,.035,.025],[-.04,.058,.043],[.035,.056,.04],[.075,.012,.01]],2.7),skinTone,root,[.43,.55,.18]);
    for(const x of [-.17,.17]){
      cylinder(root,skinTone,.064,.064,.23,[x,-.24,0]);cylinder(root,shirt,.083,.083,.15,[x,-.405,0]);
      for(const y of [-.36,-.4,-.44])cylinder(root,blue,.084,.084,.012,[x,y,0]);
      const shoeForm=sculpt([[-.14,.055,.05],[-.1,.105,.07],[0,.125,.095],[.16,.135,.07],[.27,.1,.035],[.3,.008,.007]],3.2);
      const upper=mesh(shoeForm,shoe,root,[x,-.49,0]);upper.rotation.x=Math.PI/2;
      const sole=mesh(sculpt([[-.14,.06,.013],[-.06,.118,.019],[.15,.139,.019],[.28,.095,.014],[.3,.008,.006]],3.5),shirt,root,[x,-.565,0]);sole.rotation.x=Math.PI/2;
      stitch(root,[[x-.11,-.52,.12],[x,-.535,.285],[x+.11,-.52,.12]],cream,.004);
      const band=mesh(rounded(.2,.055,.018,.02),shirt,root,[x,-.47,.257]);band.rotation.x=-.25;
    }
    const strap=mesh(rounded(.047,.66,.025,.01),leather,root,[.01,.34,.26]);strap.rotation.z=-.52;
    mesh(sculpt([[-.1,.115,.052],[-.08,.165,.07],[.03,.17,.073],[.16,.145,.055],[.175,.1,.03]],4),leather,root,[-.29,0,.23]);
    mesh(rounded(.31,.13,.025,.035),clay,root,[-.29,.11,.305]);
    stitch(root,[[-.42,.135,.34],[-.42,.075,.34],[-.29,.045,.345],[-.16,.075,.34],[-.16,.135,.34]],gold,.003);
    mesh(rounded(.045,.05,.01,.008),gold,root,[-.29,.075,.345]);
    mesh(sculpt([[-.09,.035,.02],[-.06,.07,.034],[.05,.07,.034],[.09,.03,.02]],3.5),leafGreen,root,[.13,.17,.29]);cylinder(root,shirt,.026,.026,.025,[.13,.28,.29]);
    // The over-shoulder flower bundle from the reference is a permanent part of the silhouette.
    const bundle=new THREE.Group();root.add(bundle);
    limb(bundle,green,[.5,-.04,.03],[-.45,1.76,-.2],.033);
    mesh(sculpt([[1.23,.025,.025],[1.29,.17,.13],[1.48,.245,.17],[1.67,.17,.14],[1.82,.06,.05],[1.88,.01,.01]],2.5,.007),gold,bundle,[-.49,0,-.27]);
    for(const x of [-.61,-.49,-.37])stitch(bundle,[[x,1.37,-.11],[x,1.56,-.085],[x,1.76,-.17]],yellow,.005);
    const longLeaf=mesh(leafGeometry(),leafGreen,bundle,[-.42,1.44,-.27],[.8,1.18,1]);longLeaf.rotation.z=.2;
    const ribbon=mesh(new THREE.TorusGeometry(.075,.025,8,20),gold,bundle,[-.34,1.48,-.16]);ribbon.rotation.z=.4;
    for(const side of [-1,1]){const bow=ball(bundle,gold,[-.34+side*.09,1.48,-.12],[.1,.038,.025]);bow.rotation.z=side*.5;}
    const leafPin=new THREE.Group(),flowerPin=new THREE.Group(),plain=new THREE.Group();root.add(leafPin,flowerPin,plain);
    const pin=mesh(leafGeometry(),leafGreen,leafPin,[-.16,.43,.27],[.2,.2,1]);pin.rotation.z=.5;
    for(let i=0;i<5;i++){const a=i/5*Math.PI*2;ball(flowerPin,shirt,[-.16+Math.cos(a)*.035,.45+Math.sin(a)*.035,.28],[.025,.025,.012]);}ball(flowerPin,gold,[-.16,.45,.3],[.018,.018,.01]);
    leafPin.scale.setScalar(1.8);flowerPin.scale.setScalar(1.8);
    leafPin.position.set(.128,-.344,.05);flowerPin.position.set(.128,-.36,.05);
    root.userData.customColors={blue,leafGreen,shoe};
    root.userData.accessories={leaves:plain,mushroom:leafPin,flower:flowerPin};leafPin.visible=flowerPin.visible=false;
    root.traverse(object=>{if(object instanceof THREE.Mesh){object.castShadow=true;object.receiveShadow=true;}});
    root.userData.action='wave';buddies.push({root,arm,head,wrist,eyes});return root;
  };
  const flowers: THREE.Group[] = [];
  const garden = (parent: THREE.Object3D) => {
    const root = new THREE.Group(); parent.add(root);
    cylinder(root, soil, 1.65, 1.5, .22, [0, -.6, 0]);
    cylinder(root, sage, 1.68, 1.68, .1, [0, -.45, 0]);
    const friend = buddy(root); friend.scale.setScalar(.58); friend.position.set(-.25, -.05, .1);
    for (let i = 0; i < VISIBLE_PLANT_LIMIT; i++) {
      const flower = new THREE.Group(); root.add(flower); flowers.push(flower);
      flower.userData.slot = i;
      const angle = i / VISIBLE_PLANT_LIMIT * Math.PI * 2;
      flower.position.set(Math.cos(angle) * 1.15, -.38, Math.sin(angle) * 1.05);
      cylinder(flower, green, .025, .025, .5, [0, .22, 0]);
      const leaf = ball(flower, green, [.1, .12, 0], [.15, .045, .06]); leaf.rotation.z = .5;
      for (let p = 0; p < 5; p++) {
        const a = p / 5 * Math.PI * 2;
        const petal = ball(flower, pink, [Math.cos(a) * .12, .52 + Math.sin(a) * .12, 0], [.09, .09, .055]);
        petal.userData.petal = true;
      }
      ball(flower, yellow, [0, .52, .045], [.06, .06, .04]);
      flower.userData.action = "water";
    }
    root.userData.action = "water";
    return root;
  };
  const friendView = new THREE.Group(); scene.add(friendView);
  buddy(friendView);
  const ground=cylinder(friendView, cream, 1.35, 1.35, .035, [0, -.64, 0]);ground.receiveShadow=true;
  const gardenView = new THREE.Group(); scene.add(gardenView);
  garden(gardenView); gardenView.rotation.y = -.45;
  const toyView = new THREE.Group(); scene.add(toyView);
  mesh(rounded(2.45, 3.55, .36, .32), shell, toyView, [0, 0, -.3]);
  mesh(rounded(2.27,3.35,.02,.25),sage,toyView,[0,0,-.35]);
  mesh(rounded(2.07, 1.8, .055, .16), dark, toyView, [0, .64, .07]);
  mesh(rounded(1.88, 1.59, .03, .12), cream, toyView, [0, .64, .14]);
  const miniature = garden(toyView);
  miniature.scale.setScalar(.46); miniature.position.set(0, .66, .35); miniature.rotation.x = .45;
  const dpad = new THREE.Group(); toyView.add(dpad); dpad.position.set(-.62, -.83, .17);
  mesh(rounded(.67, .23, .12, .04), green, dpad, [0, 0, 0]);
  mesh(rounded(.23, .67, .12, .04), green, dpad, [0, 0, 0]); dpad.userData.action = "turn";
  const toyButtons: THREE.Mesh[] = [];
  for (const [x, y, material, action] of [[.65, -.72, pink, "water"], [.29, -1.07, yellow, "wave"]] as const) {
    const button = cylinder(toyView, material, .18, .18, .13, [x, y, .24]);
    button.rotation.x = Math.PI / 2; button.userData.action = action;
    toyButtons.push(button);
  }
  for (let i = 0; i < 5; i++) mesh(rounded(.045, .2, .01, .02), green, toyView, [.38 + i * .09, -1.49, .1]);
  const sticker = ball(toyView, pink, [-.85, 1.43, .14], [.12, .12, .035]); sticker.userData.action = "wave";
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2;ball(toyView,cream,[-.85+Math.cos(a)*.12,1.43+Math.sin(a)*.12,.15],[.065,.065,.025]);}
  const labelCanvas=document.createElement("canvas");labelCanvas.width=512;labelCanvas.height=80;
  const context=labelCanvas.getContext("2d")!;context.fillStyle="#42583a";context.font="28px Georgia";context.textAlign="center";context.fillText("P O C K E T   G A R D E N",256,46);
  const labelTexture=new THREE.CanvasTexture(labelCanvas);labelTexture.colorSpace=THREE.SRGBColorSpace;
  const labelMaterial=new THREE.MeshBasicMaterial({map:labelTexture,transparent:true});materials.add(labelMaterial);
  mesh(new THREE.PlaneGeometry(1.6,.25),labelMaterial,toyView,[0,-.43,.15]);
  toyView.rotation.x = -.14; toyView.rotation.y = -.16;
  const drops = Array.from({ length: 12 }, (_, i) => {
    const drop = ball(scene, i % 3 ? lilac : yellow,
      [Math.sin(i * 2.4) * 1.1, 1.8, Math.cos(i * 2.4) * .7], [.035, .065, .035]);
    drop.visible = false; return drop;
  });
  let active: THREE.Group = friendView;
  let action: PocketAction | null = null, actionStart = 0, angle = 0, displayedAngle=0, turns=0;
  let pointerX = 0, pointerY = 0, frame = 0, visible = true, disposed = false, until = 0;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reset = () => {
    for(const b of buddies){b.root.position.y=b.root.parent===friendView?0:-.05;b.arm.rotation.set(0,0,0);}
    for(const drop of drops)drop.visible=false;
  };
  const render = (now:number) => {
    frame=0;
    if(disposed||!visible||document.hidden)return;
    reset();
    const seconds=(now-actionStart)/1000;
    const playing=action&&seconds<2.2&&!motion.matches;
    displayedAngle=motion.matches?angle:THREE.MathUtils.lerp(displayedAngle,angle,.12);
    const clock=now/1000;
    for (const b of buddies) {
      const breathing=motion.matches?0:Math.sin(clock*1.65)*.008;
      b.root.scale.y=b.root.scale.x*(1+breathing);
      b.head.rotation.set(motion.matches?0:Math.sin(clock*.8)*.025+pointerY*.06,motion.matches?0:pointerX*.2+Math.sin(clock*.45)*.035,0);
      b.arm.rotation.z=motion.matches?0:Math.sin(clock*1.65+.5)*.025;
      b.wrist.rotation.z=0;
      const blinkPhase=clock%4.7;
      const blink=motion.matches?1:1-Math.exp(-Math.pow((blinkPhase-4.4)/.07,2))*.92;
      b.eyes.forEach(eye=>{eye.scale.y=(eye.userData.restEye||.095)*blink;eye.position.x=eye.userData.restX+(motion.matches?0:pointerX*.008);});
      if (playing && (action === "wave" || action === "celebrate")) {
        // Ease into the pose, overlap the hand, and settle instead of snapping back.
        const envelope=THREE.MathUtils.smoothstep(seconds,0,.45)*(1-THREE.MathUtils.smoothstep(seconds,1.55,2.2));
        b.arm.rotation.z=-.75*envelope;
        b.arm.rotation.x=Math.sin(seconds*5)*.08*envelope;
        b.wrist.rotation.z=Math.sin(seconds*10)*.35*envelope;
        b.head.rotation.z=-.075*envelope;
        b.root.rotation.z=Math.sin(seconds*3)*.035*envelope;
        if(action==="celebrate")b.root.position.y+=Math.pow(Math.max(0,Math.sin(seconds*5)),2)*.09*envelope;
      } else {b.arm.rotation.x=0;b.root.rotation.z=0;}
    }
    for (const flower of flowers) flower.rotation.z = playing && action === "water" ? Math.sin(seconds * 6 + flower.position.x) * .13 : 0;
    for (let i = 0; i < drops.length; i++) {
      const drop = drops[i];
      drop.visible = !!playing && (action === "water" || action === "celebrate");
      drop.position.y = 1.9 - ((seconds * 1.1 + i * .12) % 1.9);
      drop.position.x=Math.sin(i*2.4)*(active===toyView?.65:1.1);
      if(active===toyView)drop.position.y=1.42-((seconds*.7+i*.08)%.9);
      drop.position.z=active===toyView?.65:Math.cos(i*2.4)*.7;
      drop.material = action === "water" ? lilac : yellow;
    }
    active.rotation.y = (active === toyView ? -.16 : 0) + displayedAngle + (motion.matches ? 0 : pointerX * .13);
    active.rotation.x = pitch + (active === toyView ? -.14 : 0) + (motion.matches ? 0 : pointerY * .06);
    if(active===toyView && playing){active.rotation.z=Math.sin(seconds*8)*.045*Math.exp(-seconds);active.position.y=Math.sin(seconds*5)*.045;}
    else {active.rotation.z=0;active.position.y=0;}
    renderer.render(scene, camera);
    if (!motion.matches && (now < until || visible)) frame = requestAnimationFrame(render);
  };
  const wake = (duration = 0) => {
    until = Math.max(until, performance.now() + duration);
    if (!frame && visible && !document.hidden && !disposed) frame = requestAnimationFrame(render);
  };
  const act = (next: PocketAction) => {
    action = next; actionStart = performance.now();
    if (next === "turn") {turns++;angle=active===toyView?[-.32,.25,.45,0][turns%4]:angle+Math.PI/4;}
    wake(motion.matches ? 0 : 2300);
  };
  const raycaster = new THREE.Raycaster();
  let drag: {id:number;x:number;y:number;startX:number;startY:number;moved:boolean}|null=null;
  let pitch=0;
  const down=(event:PointerEvent)=>{
    if(event.button!==0)return;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,moved:false};
    host.setPointerCapture(event.pointerId);host.classList.add("is-orbiting");
  };
  const pointer = new THREE.Vector2();
  const move = (event: PointerEvent) => {
    if(drag && drag.id===event.pointerId){
      angle+=(event.clientX-drag.x)*.012;
      pitch=THREE.MathUtils.clamp(pitch+(event.clientY-drag.y)*.004,-.4,.4);
      drag.moved ||= Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)>5;
      drag.x=event.clientX;drag.y=event.clientY;
      host.dataset.rotation=String(Math.round(angle*180/Math.PI));wake(180);return;
    }
    const rect = host.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width * 2 - 1;
    pointerY = (event.clientY - rect.top) / rect.height * 2 - 1;
    wake();
  };
  const leave = () => { pointerX = pointerY = 0; wake(); };
  const click = (event: PointerEvent) => {
    const wasDragging=drag?.moved;
    if(drag){if(host.hasPointerCapture(drag.id))host.releasePointerCapture(drag.id);drag=null;host.classList.remove("is-orbiting");}
    wake(700);
    if(wasDragging)return;
    const rect = host.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    scene.updateMatrixWorld(true);
    raycaster.setFromCamera(pointer, camera);
    for (const hit of raycaster.intersectObject(active, true)) {
      let ancestor: THREE.Object3D | null = hit.object;
      let shown = true;
      while (ancestor) { if (!ancestor.visible) shown = false; ancestor = ancestor.parent; }
      if (!shown) continue;
      let object: THREE.Object3D | null = hit.object;
      while (object && !object.userData.action) object = object.parent;
      if (object?.userData.action) { onAction(object.userData.action as PocketAction); return; }
    }
  };
  const cancel=()=>{drag=null;host.classList.remove("is-orbiting");wake();};
  const resize = () => {
    const width = Math.max(host.clientWidth, 1), height = Math.max(host.clientHeight, 1);
    const aspect = width / height;
    camera.left = -2.25 * aspect; camera.right = 2.25 * aspect;
    camera.updateProjectionMatrix(); renderer.setSize(width, height); wake();
  };
  const observer = new ResizeObserver(resize); observer.observe(host);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wake(); else { cancelAnimationFrame(frame); frame = 0; }
  }); intersection.observe(host);
  const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else wake(); };
  const lost = (event: Event) => { event.preventDefault(); host.dispatchEvent(new Event("pocket-context-lost")); };
  renderer.domElement.addEventListener("webglcontextlost", lost);
  host.addEventListener("pointerdown",down);host.addEventListener("pointercancel",cancel);
  host.addEventListener("pointermove", move); host.addEventListener("pointerleave", leave); host.addEventListener("pointerup", click);
  document.addEventListener("visibilitychange", visibility); motion.addEventListener("change", visibility);
  const view = (next: PocketView) => {
    reset(); action = null; angle = displayedAngle = pitch = 0; turns=0;host.dataset.rotation="0";
    friendView.visible = next === "friend"; gardenView.visible = next === "garden"; toyView.visible = next === "toy";
    active = next === "friend" ? friendView : next === "garden" ? gardenView : toyView;
    camera.zoom = next === "garden" ? .9 : 1.3;
    camera.updateProjectionMatrix();
    wake();
  };
  view("friend"); resize();
  const moodMaterials = new Map<Mood, THREE.MeshStandardMaterial>();
  for (const key of Object.keys(MOOD_PLANTS) as Mood[]) moodMaterials.set(key, color(new THREE.Color(MOOD_PLANTS[key].accent).getHex()));
  const moods = (entries: Mood[]) => {
    for (const flower of flowers) {
      const mood = entries[flower.userData.slot];
      flower.visible = !!mood;
      if (mood) flower.traverse(object => {
        if (object instanceof THREE.Mesh && object.userData.petal) object.material = moodMaterials.get(mood)!;
      });
    }
    wake();
  };
  moods([]);
  const customize=(tint:"moss"|"rose"|"lavender",accessory:"leaves"|"mushroom"|"flower")=>{
    skin.color.setHex({moss:0x91ac75,rose:0xd9aba9,lavender:0xb9a4cc}[tint]);shell.color.copy(skin.color);
    for(const buddy of buddies){
      const colors=buddy.root.userData.customColors as Record<string,THREE.MeshStandardMaterial>;
      colors.blue.color.setHex({moss:0x70aac5,rose:0xcb809b,lavender:0x9d8bcb}[tint]);
      colors.leafGreen.color.setHex({moss:0x94b94a,rose:0xb88b73,lavender:0x8d9bac}[tint]);
      colors.shoe.color.setHex({moss:0x82ac9b,rose:0xbc8a96,lavender:0x9b91b7}[tint]);
      const hats=buddy.root.userData.accessories as Record<string,THREE.Group>;for(const [key,hat] of Object.entries(hats))hat.visible=key===accessory;}
    wake();
  };
  return { view, act, moods, customize, dispose() {
    disposed = true; cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect();
    host.removeEventListener("pointermove", move); host.removeEventListener("pointerleave", leave); host.removeEventListener("pointerup", click);
    host.removeEventListener("pointerdown",down);host.removeEventListener("pointercancel",cancel);
    document.removeEventListener("visibilitychange", visibility); motion.removeEventListener("change", visibility);
    renderer.domElement.removeEventListener("webglcontextlost", lost);
    geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose());
    renderer.dispose(); renderer.domElement.remove();
    labelTexture.dispose();
  } };
}

