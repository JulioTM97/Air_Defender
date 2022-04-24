//obtener el canvas y el contexto para dibujar 2D.
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
var isRunning = false;
//esto es para que las imagenes salgan en pixelart
ctx.imageSmoothingEnabled = false;

//cargar los sonidos del juego
const sonidoDisparo = new Audio('resources/Shoot.wav');
const sonidoExplosion = new Audio('resources/Explosion.wav');

//declaro el alto y ancho del canvas como constantes.
const GameControl = {
	CANVAS_H: canvas.height,
	CANVAS_W: canvas.width,
	ScoreManager: {
		scoreElement: document.getElementById("score"),
		hiScoreElement: document.getElementById("hi-score"),
		score:0,
		hiScore:0,
		setScore:function(_score){
			if(_score>0){
				this.score+=_score;
				this.scoreElement.innerHTML = this.score;
				if(this.score>this.hiScore){
					this.hiScore = this.score;
					this.hiScoreElement.innerHTML = this.hiScore;
				}
			} else{
				this.score=0;
				this.scoreElement.innerHTML = this.score;
			}
		}
	},

	//esta funcion se llama al inicio del juego
	start: function(){
		Enemy.enemies.forEach( function(element, index) {
			element.deshabilitar();
		});
		player.shoto.deshabilitar();
		player.posicion.y = 140;
		player.nivel = 1;
		isRunning = true;
		this.ScoreManager.setScore(0);
		ctx.clearRect(0,0,canvas.width,canvas.height);
		canvas.style.backgroundImage = 'url("resources/background.png")';
	},

	end: function(){
		isRunning = false;
		ctx.clearRect(0,0,canvas.width,canvas.height);
		canvas.style.backgroundImage = 'url("resources/end.png")';
	},

	//esta funcion no acepta 'this' al ser llamada desde 'setInterval()'
	frame: function(){
		if(isRunning){
			ctx.clearRect(0,0,canvas.width,canvas.height);
			
			GameObjects.gameObjects.forEach(function(elemento){
				elemento.update();
			});
			GameObjects.gameObjects.forEach(function(elemento){
				elemento.verificarColisiones();
			});
		} else ctx.clearRect(0,0,canvas.width,canvas.height); 
	}
}

//esta constante almacena todos los objetos de juego
const GameObjects = {
	gameObjects: new Array()
}

const Enemies = {
	enemies: new Array()
}

class GameObject {
		posicion = {x:0,y:0};
		size = {width:0,height:0};
		sprite = new Image();
		tag ="";


	constructor(){
		GameObjects.gameObjects.push(this);
	}

	verificarColisiones (){
		let colisionoCon = new Array();
        let objeto = this;

        GameObjects.gameObjects.forEach(function(elemento,index){
        	let colision = true;
        	if(objeto!=elemento){
		        if (objeto.posicion.x > elemento.posicion.x + elemento.size.width)
		            colision = false;
		        if (objeto.posicion.x + objeto.size.width < elemento.posicion.x)
		            colision = false;
		        if (objeto.posicion.y > elemento.posicion.y + elemento.size.height)
		            colision = false;
		        if (objeto.posicion.y + objeto.size.height < elemento.posicion.y)
		            colision = false;
		        if(colision) colisionoCon.push(elemento);
	    	}
        });
    	this.onColision(colisionoCon);

    }

	update(){
		ctx.drawImage(this.sprite,this.posicion.x, this.posicion.y, 
			this.size.width, this.size.height);
	}

	onColision(objetos){

	}
}

class Player extends GameObject {
	nivel=1;
	shoto;
	constructor(){
		super();
		this.tag = "player";
		this.sprite.src = "resources/a.png";
		this.size.width = 100;
		this.size.height= 80;
		this.posicion.y = 140;
		this.shoto = new Shoot(this);
	}

	calcularPosicionY(direccion) {
		switch (direccion) {
			case "arriba":
				this.nivel++;
				break;
			case "abajo":
				this.nivel--;
				break;
			default:
				console.log("direccion no valida");
				break;
		}
		if (this.nivel<0) this.nivel=0;
		if (this.nivel>2) this.nivel=2;
		this.posicion.y = ((GameControl.CANVAS_H/3)*this.nivel)+((GameControl.CANVAS_H/3)-this.size.height)/2;
		
	}

	onColision(objetos){
	}

	disparar(){
		if(this.shoto.habilitado) return;
		sonidoDisparo.play();
		this.shoto.habilitado = true;
		this.shoto.posicion.x = this.size.width-40;
		this.shoto.posicion.y = this.posicion.y+(this.size.height/2);
	}
}

class Enemy extends GameObject{
	habilitado=false;
	static velocidad = 0;
	nivel=1;
	llamada1 = false;
	llamada2 = false;
	static enemies = new Array();

	constructor(){
		super();
		this.tag = "enemy";
		this.sprite.src = "resources/b.png";
		this.size.width = 100;
		this.size.height= 80;
		this.posicion.x = GameControl.CANVAS_H+100;
		this.moverRandom();
		Enemy.enemies.push(this);
	}

	update(){
		Enemy.calcularVelocidad();

		if (this.posicion.x+this.size.width>0 && this.habilitado==true) {
			ctx.drawImage(this.sprite,this.posicion.x, this.posicion.y, 
			this.size.width, this.size.height);
			this.posicion.x -= Enemy.velocidad;
		} else {
			this.deshabilitar();
		}

		if(this.posicion.x+this.size.width<0){
			this.deshabilitar();
			GameControl.end();
		}

		//ARREGLAR ESTO PARA HACERSE UNA SOLA VEZ
		if(this.posicion.x<GameControl.CANVAS_W/3*2) {
			if(Enemy.siquienteListo()!=null && this.llamada1==false){
				Enemy.setearInicio(Enemy.enemies[Enemy.siquienteListo()]);
				this.llamada1=true;
			}
			
		}
		if(this.posicion.x<GameControl.CANVAS_W/3) {
			if(Enemy.siquienteListo()!=null && this.llamada2==false){
				Enemy.setearInicio(Enemy.enemies[Enemy.siquienteListo()]);
				this.llamada2=true;
			}
			
		}
		Enemy.chequearEnemigosHabiles();
	}

	deshabilitar(){
		this.posicion.x = GameControl.CANVAS_H+100;
		this.habilitado = false;
	}

	moverRandom(){
		this.posicion.y = ((GameControl.CANVAS_H/3)*Math.floor(Math.random()*3))+((GameControl.CANVAS_H/3)-this.size.height)/2;
	}


	static chequearEnemigosHabiles(){
		let disponibles = false;
		Enemy.enemies.forEach(function(element) {
			if(element.habilitado) disponibles = true;
		});
		if (!disponibles){
			Enemy.setearInicio(Enemy.enemies[0]);
		}
	}

	static setearInicio(_enemigo){
		_enemigo.habilitado=true;
		_enemigo.moverRandom();
		_enemigo.posicion.x = GameControl.CANVAS_W;
		_enemigo.llamada1=false;
		_enemigo.llamada2=false;
	}

	static siquienteListo(){
		let indice=null;
		Enemy.enemies.forEach(function(element,index) {
			if(!element.habilitado) indice = index;
		});
		return indice;
	}

	static calcularVelocidad(){
		if(Enemy.velocidad >= 9)return;
		Enemy.velocidad=(Math.floor(GameControl.ScoreManager.score)/200)+1;
	}

	onColision(objetos){
	}
}

class Shoot extends GameObject{
	habilitado = false;
	velocidad = 16;
	player;
	puntos = 10;

	constructor(_player){
		super();
		this.tag = "shoot";
		this.sprite.src = "resources/shoot.png";
		this.size.width = 20;
		this.size.height= 10;
		this.posicion.y = 240;
		this.player = _player;
	}

	update(){
		if(!this.habilitado) return;
		if(this.posicion.x>GameControl.CANVAS_W) {
			this.deshabilitar();
		}
		this.posicion.x += this.velocidad;
		ctx.drawImage(this.sprite,this.posicion.x, this.posicion.y, 
			this.size.width, this.size.height);
	}
	onColision(objetos){
		//este objeto
		let bullet = this;
		let _puntos = this.puntos;
		objetos.forEach(function(element,index){
			if(element.tag=="enemy") {
				element.deshabilitar();
				bullet.deshabilitar();
				GameControl.ScoreManager.setScore(_puntos);
				sonidoExplosion.play();
			}
		});
	}

	deshabilitar(){
		this.posicion.y = -10;
		this.habilitado = false;
	}
}


class Nube extends GameObject{

	velocidad=1;
	contador = 0;

	constructor(_posicionInicialX){
		super();
		this.tag = "nube";
		this.size.width = 64;
		this.size.height = 40;
		this.posicion.x = _posicionInicialX-(this.size.width/2);
		this.posicion.y = this.moverRandomTop();
		this.sprite.src = "resources/cloud.png";
	}

	update(){
		if (this.contador>0){
			this.posicion.x -= this.contador;
			this.contador = 0;
		} else this.contador += this.velocidad;
		if (this.posicion.x+this.size.width<0) this.posicion.x = GameControl.CANVAS_W;
		ctx.drawImage(this.sprite,this.posicion.x, this.posicion.y, 
			this.size.width, this.size.height);
	}

	moverRandomTop(){
		let numeroRandom = Math.floor(Math.random()*120);
		if(numeroRandom+this.size.height>120)
			return numeroRandom-this.size.height;
		else
			return numeroRandom;
	}

}
//tomo el body para agregarle los eventos.
var body = document.body;

body.onkeydown = function(e){
	if (e.key == "ArrowUp" || e.key == "W" || e.key == "w")		
		player.calcularPosicionY("abajo");
	if (e.key == "ArrowDown" || e.key == "S" || e.key == "s")
		player.calcularPosicionY("arriba");
	if (e.key == " "){
		player.disparar();
		if(!isRunning)GameControl.start();
	}
}

nube1 = new Nube(80);
nube2 = new Nube(250);
nube3 = new Nube(400);


player = new Player();
enemy1 = new Enemy();
enemy2 = new Enemy();
enemy3 = new Enemy();

GameControl.end();

setInterval(GameControl.frame,20);

