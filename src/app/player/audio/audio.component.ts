import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { PlayerService } from '../player.service';
import { Particle } from '../lyrics/particles';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-player-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.css']
})
export class AudioComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {

  // tslint:disable:no-output-on-prefix
  @Output() onCurrentTimeUpdate = new EventEmitter<number>();
  @Output() onPlayPause = new EventEmitter<boolean>();
  @Input() src: string;
  private audio: HTMLAudioElement;
  private timeSubscription: Subscription;
  private loadSubscription: Subscription;
  public isPlaying: boolean = false;
  public currentTime: string;
  public duration: string;
  private MP3_PATH = '';
  private NUM_PARTICLES = 150;
  private onUpdate;

  NUM_BANDS = 128;

  SMOOTHING = 0.5;


  constructor(private service: PlayerService) {
    console.log(`${AudioComponent.name}::ctor`);

  }

  ngOnInit() {
    this.audio = this.initAudio();
    this.sketch();

    this.currentTime = this.service.formatTime(0);
    this.duration = this.service.formatTime(0);
  }

  ngAfterViewInit() {
    console.log(`${AudioComponent.name}::ngAfterViewInit`);

    // Loads new audio source
    this.loadAudioSource(this.src);

    // Subscribes timeupdate
    this.timeSubscription = Observable
      .fromEvent(this.audio, 'timeupdate')
      .subscribe(this.handleAudioTimeUpdate);

    // Subscribe to loaded event
    this.loadSubscription = Observable
      .fromEvent(this.audio, 'loadeddata')
      .subscribe(this.handleAudioLoaded);

  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.service.hasPropertyChanged(changes.src)) {
      this.loadAudioSource(changes.src.currentValue);
    }
  }

  ngOnDestroy() {
    console.log(`${AudioComponent.name}::ngOnDestroy`);

    // Unsubscribe
    this.timeSubscription.unsubscribe();
    this.loadSubscription.unsubscribe();

    // Destroy audio tag
    this.loadAudioSource('');
    this.audio.load();
    const windows = <any>window;
    if (windows.Sketch.instances.length > 0) {
      windows.Sketch.instances[0].destroy();
    }
  }

  public initAudio(): HTMLAudioElement {
    console.log(`${AudioComponent.name}::initAudio`);

    const audio = new Audio();
    audio['autobuffer'] = true;
    audio.autoplay = false;
    audio.preload = 'auto';

    return audio;
  }

  public loadAudioSource(src: string) {
    console.log(`${AudioComponent.name}::loadAudioSource`);

    this.audio.pause();
    this.handleAudioPaused();
    this.audio.src = src;
    this.analizerAudio(this.audio);
  }

  public handleAudioLoaded = (e: HTMLMediaElementEventMap) => {
    console.log(`${AudioComponent.name}::handleAudioLoaded`);

    this.duration = this.service.formatTime(this.audio.duration);
  }

  public handleAudioTimeUpdate = (e: HTMLMediaElementEventMap) => {
    console.log(`${AudioComponent.name}::handleAudioTimeUpdate`);

    this.currentTime = this.service.formatTime(this.audio.currentTime);
    this.onCurrentTimeUpdate.emit(this.audio.currentTime);
  }

  public handleAudioPlayed = () => {
    console.log(`${AudioComponent.name}::handleAudioPlayed`);
    this.onPlayPause.emit(true);
    this.isPlaying = true;
  }

  public handleAudioPaused = () => {
    console.log(`${AudioComponent.name}::handleAudioPaused`);
    this.onPlayPause.emit(false);
    this.isPlaying = false;
  }

  public handleAudioPlayPause() {
    console.log(`${AudioComponent.name}::handleAudioPlayPause`);

    if (this.audio.paused) {
      this.audio.play();
    } else {
      this.audio.pause();
    }
  }

  public sketch() {
    const windows = <any>window;

    const self = this;
    // Sketch
    windows.Sketch.create(
      {
        particles: [],
        setup: function () {
          // let analyser;
          let error;
          let i = 0;
          let intro;
          let j = 0;
          let particle;
          const ref = self.NUM_PARTICLES - 1;
          let warning;
          let x;
          let y;

          // generate some particles
          for (ref; j <= ref; j += 1) {
            i = i + 1;
            x = Math.random() * this.width;
            y = Math.random() * this.height * 2;
            particle = new Particle(x, y);
            this.particles.push(particle);
          }

          const w = <any>window;
          const aver = w.AudioContext || w.webkitAudioContext;

          try {

            // update particles based on fft transformed audio frequencies
            self.onUpdate = (bands) => {
              let k = 0;
              let results;
              const ref1 = this.particles;
              const len = ref1.length;
              results = [];
              for (len; k < len; k++) {
                particle = ref1[k];
                results.push(particle.energy = bands[particle.band] / 256);
              }
              return results;
            };

            intro = document.getElementById('intro');
            intro.style.display = 'none';

            // bug in Safari 6 when using getByteFrequencyData with MediaElementAudioSource
            // @see https://goo.gl/6WLx1
            if (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) {
              warning = document.getElementById('warning2');
              return warning.style.display = 'block';
            }
          } catch (error1) {
            error = error1;
          }
        },
        draw: function () {
          let j;
          let particle;
          let ref;
          let results;
          this.globalCompositeOperation = 'lighter';
          ref = this.particles;
          const len = ref.length;
          results = [];
          for (j = 0, len; j < len; j++) {
            particle = ref[j];

            // recycle particles
            if (particle.y < -particle.size * particle.level * particle.scale * 2) {
              particle.reset();
              particle.y = this.height + particle.size * particle.scale * particle.level;
            }
            particle.move();
            results.push(particle.draw(this));
          }
          return results;
        }
      }
    );
  }

  public animates() {
    this.sketch();
  }


  public analizerAudio(audio) {
    console.log('analizerAudio');

    const w = <any>window;
    const numBands = 256;
    const smoothing = 0.3;
    let context;
    let jsNode;
    let analyser;
    let bands;
    let source;
    let enabled = null;
    let src;
    const windows = <any>window;
    const audioContext = windows.AudioContext || windows.webkitAudioContext;

    enabled = windows.AudioContext != null;

    // construct audio object
    if (typeof audio === 'string') {
      src = audio;
      audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.controls = true;
      audio.src = src;
    }

    // setup audio context and nodes
    // const audioAnalyser = <any>self.audioAnalyserFun;
    context = new AudioContext();

    // createScriptProcessor so we can hook onto updates
    jsNode = context.createScriptProcessor(2048, 1, 1);

    // smoothed analyser with n bins for frequency-domain analysis
    analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = smoothing;
    analyser.fftSize = numBands * 2;

    // persistant bands array
    bands = new Uint8Array(analyser.frequencyBinCount);
    // circumvent http://crbug.com/112368
    this.audio.addEventListener('canplay', () => {

      // Subscribe other events
      this.audio.addEventListener('playing', () => {
        console.log('PLAY');
        this.onPlayPause.emit(true);
        this.isPlaying = true;
        this.audio.play();
      });
      this.audio.addEventListener('pause', () => {
        console.log('PAUSA');
        this.onPlayPause.emit(false);
        this.isPlaying = false;
        this.audio.pause();
      });
      // media source
      source = context.createMediaElementSource(audio);
      // wire up nodes
      source.connect(analyser);
      analyser.connect(jsNode);
      jsNode.connect(context.destination);
      source.connect(context.destination);
      const self = this;
      // update each time the JavaScriptNode is called
      return jsNode.onaudioprocess = () => {
        // retreive the data from the first channel
        analyser.getByteFrequencyData(bands);
        if (!audio.paused) {
          return typeof self.onUpdate === 'function' ? self.onUpdate(bands) : void 0;
        }
      };
    });
  }

}
