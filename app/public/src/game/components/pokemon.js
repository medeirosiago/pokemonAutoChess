import {GameObjects} from 'phaser';
import Lifebar from './life-bar';
import Button from './button';
import PokemonDetail from './pokemon-detail';

export default class Pokemon extends Button {
  constructor(scene, x, y, pokemon, dragable) {
    super(scene, x, y, 75, 75);
    this.objType = 'pokemon';
    this.index = pokemon.index;
    this.name = pokemon.name;
    this.id = pokemon.id;
    this.hp = pokemon.hp;
    this.range = pokemon.range;
    this.atk = pokemon.atk;
    this.def = pokemon.def;
    this.speDef = pokemon.speDef;
    this.attackType = pokemon.attackType;
    this.type = pokemon.type;
    this.atkSpeed = pokemon.atkSpeed;
    this.targetX = null;
    this.targetY = null;
    this.positionX = pokemon.positionX;
    this.positionY = pokemon.positionY;
    this.attackSprite = pokemon.attackSprite;
    this.setRangeType();
    this.setMovingFunction(scene);
    this.setParameters(pokemon);
    this.setSprite(pokemon, scene);
    if (dragable) {
      scene.input.setDraggable(this);
    }
    if (pokemon.life) {
      this.life = pokemon.life;
    }
    this.setDepth(5);
  }

  enterButtonHoverState() {
    if (!this.getFirst('objType', 'detail')) {
      if (this.life) {
        this.add(new PokemonDetail(this.scene, 20, -130, this.name, this.life, this.atk, this.def, this.speDef, this.attackType, this.range, this.atkSpeed));
      } else {
        this.add(new PokemonDetail(this.scene, 20, -130, this.name, this.hp, this.atk, this.def, this.speDef, this.attackType, this.range, this.atkSpeed));
      }
    }
  }

  enterButtonRestState() {
    const detail = this.getFirst('objType', 'detail');
    if (detail) {
      this.remove(detail);
    }
  }

  enterButtonActiveState() {
  }

  attackAnimation() {
    let x;
    let y;
    if (this.range > 1) {
      x = this.positionX;
      y = this.positionY;
    } else {
      x = this.targetX;
      y = this.targetY;
    }
    const coordinates = window.transformAttackCoordinate(x, y);
    this.projectile = this.scene.add.sprite(coordinates[0], coordinates[1], 'attacks', `${this.attackSprite}/000`);
    const scale = window.getAttackScale(this.attackSprite);
    this.projectile.setScale(scale[0], scale[1]);
    this.projectile.anims.play(`${this.attackSprite}`);
    this.addTween();
  }

  addTween() {
    const coordinates = window.transformAttackCoordinate(this.targetX, this.targetY);
    if (this.scene) {
      // console.log(`Shooting a projectile to (${this.targetX},${this.targetY})`);
      this.scene.tweens.add({
        targets: this.projectile,
        x: coordinates[0],
        y: coordinates[1],
        ease: 'Linear',
        duration: this.atkSpeed,
        onComplete: (tween, targets) => {
          targets[0].setVisible(false);
          if (this.checkAnimations()) {
            this.replayAnimations();
          } else {
            this.projectile.destroy();
          }
        }
      });
    } else {
      this.projectile.destroy();
    }
  }

  replayAnimations() {
    if (this) {
      let x;
      let y;
      if (this.range > 1) {
        x = this.positionX;
        y = this.positionY;
      } else {
        x = this.targetX;
        y = this.targetY;
      }
      const coordinates = window.transformAttackCoordinate(x, y);
      if (this.projectile.scene) {
        this.projectile.setPosition(coordinates[0], coordinates[1]);
        this.projectile.setVisible(true);
        this.projectile.setDepth(7);
        this.addTween();
      }
    } else {
      this.projectile.destroy();
    }
  }

  checkAnimations() {
    if (this.action == 'ATTACKING') {
      return true;
    } else {
      return false;
    }
  }

  setLifeBar(pokemon, scene, height) {
    if (pokemon.life) {
      let color;
      if (pokemon.team == 0) {
        color = 0x00ff00;
      } else {
        color = 0xff0000;
      }
      const lifebar = new Lifebar(scene, -15, height, pokemon.hp, color);
      lifebar.setLife(pokemon.life);
      this.add(lifebar);
    }
  }

  setEffects(pokemon, scene, height) {
    let c = 0;
    if (pokemon.effects.length > 0) {
      pokemon.effects.forEach((effect) => {
        const image = new GameObjects.Image(scene, c*20 - 20, height, 'effects', effect);
        const border = new GameObjects.Image(scene, c*20 - 20, height, 'effects', 'border');
        image.objType = 'effect';
        border.objType = 'effect';
        image.setScale(0.5, 0.5);
        border.setScale(0.5, 0.5);
        scene.add.existing(image);
        scene.add.existing(border);
        this.add(image);
        this.add(border);
        c+= 1;
      });
    }
  }

  setSprite(pokemon, scene) {
    const sprite = new GameObjects.Sprite(scene, 0, 0, `${pokemon.rarity}`, `${pokemon.index}/0/1/0`);
    sprite.setScale(2, 2);
    const socle = new GameObjects.Image(scene, 0, sprite.height, 'socle');
    socle.objType = 'socle';
    sprite.objType = 'sprite';
    scene.add.existing(socle);
    scene.add.existing(sprite);
    this.add(socle);
    this.add(sprite);
    this.setLifeBar(pokemon, scene, sprite.height/2 + 5);
    if (pokemon.effects) {
      this.setEffects(pokemon, scene, sprite.height + 30);
    }
  }

  setParameters(pokemon) {
    if (pokemon.orientation) {
      this.orientation = pokemon.orientation;
    } else {
      this.orientation = 'DOWNLEFT';
    }
    if (pokemon.action) {
      this.action = pokemon.action;
    } else {
      this.action = 'MOVING';
    }
  }

  setMovingFunction(scene) {
    this.moveManager = scene.plugins.get('rexMoveTo').add(this, {
      speed: 300,
      rotateToTarget: false
    });
  }

  setRangeType() {
    if (this.range > 1) {
      this.rangeType = 'range';
    } else {
      this.rangeType = 'melee';
    }
  }
}
