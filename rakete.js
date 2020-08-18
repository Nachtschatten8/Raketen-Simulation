var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
/*
ctx.moveTo(0,0);
ctx.lineTo(200,100);
ctx.stroke();
*/

//var zoom = 200000;
var zoom = 200;
var zoom = 200000;


ErdeRadius = 6371000 // m

class Körper {
    constructor(Masse,x,y,vx,vy,Bild,Breite,Hoehe) {
        this.x = x;
        this.y = y;
        // alte Position für den Verlet Algorithmus
        this.x0 = x;
        this.y0 = y;
        this.los = false;

        //this.z = z;
        this.Bild = new Image();
        this.Bild.src = Bild;
        this.vx = vx;
        this.vy = vy;
        this.Masse = Masse;
        this.Kraftx = 0;
        this.Krafty = 0;
        this.Hoehe = Hoehe;
        this.Breite = Breite;
        this.sichtbar = true;


    }

    malen(ctx) {
        if (!this.sichtbar) {
            return
        }

        if (this.Bild.complete) {
            let scale = 40000;
            //let centerx = ErdeRadius / scale

            let px = 650 + this.x / scale;
            let py = 350 - this.y / scale;
            let pBreite = this.Breite / scale;
            let pHoehe = this.Hoehe / scale;

            ctx.drawImage(this.Bild, px - pBreite/2, py - pHoehe/2, pBreite, pHoehe);

            /*ctx.beginPath();
            ctx.arc(px, py, pBreite, 0, 2 * Math.PI);
            ctx.stroke();*/
        }
    }

    // https://de.wikipedia.org/wiki/Verlet-Algorithmus
    // https://de.wikipedia.org/w/index.php?title=Verlet-Algorithmus&oldid=201087203
    berechneNächstePosition(dt) {
        let ax = this.Kraftx / this.Masse;
        let ay = this.Krafty / this.Masse;
        let xn;
        let yn;

        if (this.los) {
             xn = 2*this.x - this.x0 + ax * dt^2;
             yn = 2*this.y - this.y0 + ay * dt^2;
        }
        else {
            xn = this.x + this.vx * dt + ax * dt^2/2;
            yn = this.y + this.vy * dt + ay * dt^2/2;
            this.los = true;
        }

        this.x0 = this.x;
        this.y0 = this.y;
        this.x = xn;
        this.y = yn;

        //console.log("y",this.Masse,this.y);
        //alert("toto");
    }

}

function Abstand(Objekt1,Objekt2) {
    Dx = (Objekt1.x - Objekt2.x);
    Dy = (Objekt1.y - Objekt2.y);
    return Math.sqrt(Dx*Dx + Dy*Dy)
}


Rakete_Hoehe = 3*ErdeRadius/10
//var Rakete = new Körper(541e3,0,ErdeRadius + Rakete_Hoehe/2,"rocket.svg",3*ErdeRadius/17,Rakete_Hoehe);
var Rakete = new Körper(541e3,
    -ErdeRadius - Rakete_Hoehe, 0,
    0, 1000, /*  Geschwindigkeit*/
    "rocket.svg",3*ErdeRadius/17,Rakete_Hoehe);

var Erde = new Körper(
    5.972e24,
    0, 0,
    0, 0, /*  Geschwindigkeit*/
    "Erde.svg",2*ErdeRadius,2*ErdeRadius);


var Objekte = [Rakete, Erde];
//var Objekte = [Rakete];

var warten = true;



function Physik() {

    if (!warten) {

    for (Objekt of Objekte) {
        Objekt.Kraftx = 0;
        Objekt.Krafty = 0;
    }

    for (Objekt1 of Objekte) {
        for (Objekt2 of Objekte) {
            if (Objekt1 !== Objekt2) {
            Meter_pro_Pixel = 10000;
            Meter_pro_Pixel = 1;

            Dx = Meter_pro_Pixel * (Objekt1.x - Objekt2.x);
            Dy = Meter_pro_Pixel * (Objekt1.y - Objekt2.y);
            R = Math.sqrt(Dx*Dx + Dy*Dy)
            G = 6.67408e-11;
            a = -G * Objekt1.Masse * Objekt2.Masse / (R*R*R);
            //console.log("a",a*Dx,a,Dx,Dy);
            Objekt1.Kraftx += a * Dx;
            Objekt1.Krafty += a * Dy;
            }
        }
    }

        if (Abstand(Rakete,Erde) < ErdeRadius) {
            // Explosion
            var sound = document.getElementById("Feuer");
            sound.pause();
            sound.currentTime = 0;

            document.getElementById("Explosion").play();
            Rakete.Bild.src = "Explosion.svg";
            //Rakete.sichtbar = false;
            warten = true;
            setTimeout(function() {
                Rakete.sichtbar = false;
            },2000);
        }

    if (Triebwerke_brennen) {
        Rakete.Krafty += 7607e3;
        //console.log("brennen");
    }


    dt = 2*60*60;
    //dt = 4*60*60;
    dt = 60;

    for (const Objekt of Objekte){
        if (!warten) {
            Objekt.berechneNächstePosition(dt);
        }
    }
}
    document.getElementById("pos_x").innerHTML = "" + Rakete.x / ErdeRadius;
    document.getElementById("pos_y").innerHTML = "" + Rakete.y / ErdeRadius;

    setTimeout(Physik,50);
}

setTimeout(Physik,500);

function malen(Zeit) {
    ctx.clearRect(0, 0, c.width, c.height);

    for (const Objekt of Objekte){
        Objekt.malen(ctx);
    }

/*    ctx.beginPath();
   ctx.arc(Ex, Ey, 20, 0, 2 * Math.PI);
   ctx.stroke();
*/
    window.requestAnimationFrame(malen);
}

function los() {
    warten = false;
    document.getElementById("Feuer").play();

    if (!Triebwerke_brennen) {
        console.log("Feuer!")
    }
    //Triebwerke_brennen = true;
    Rakete.vy = parseFloat(document.getElementById("Geschwindigkeit").value);
    console.log("Rakete.vy ",Rakete.vy);
}

window.requestAnimationFrame(malen);

Triebwerke_brennen = false;


document.getElementById("Parameter").onsubmit = function(event) {
    event.preventDefault();
    console.log("event", event);
    los();
    return false;
}

document.onkeydown = function(event) {
    //console.log("event down",event)
    switch (event.key) {
        case "ArrowLeft":
            // Left pressed
            break;
        case "ArrowRight":
            // Right pressed
            break;
        case "ArrowUp":
            los();
            // Up pressed
            break;
        case "ArrowDown":
            // Down pressed
            break;
    }

};

document.onkeyup = function(event) {

    switch (event.key) {
        case "ArrowLeft":
            // Left pressed
            break;
        case "ArrowRight":
            // Right pressed
            break;
        case "ArrowUp":
            if (Triebwerke_brennen) {
                console.log("stopp")
            }
            Triebwerke_brennen = false;
            // Up pressed
            break;
        case "ArrowDown":
            // Down pressed
            break;
    }

};
