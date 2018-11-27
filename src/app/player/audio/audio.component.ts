import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core'
import { Observable, Subscription } from 'rxjs';
import { PlayerService } from '../player.service';
import { Particle } from '../lyrics/particles';

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

  NUM_BANDS = 128;

  SMOOTHING = 0.5;


  constructor(private service: PlayerService) {
    console.log(`${AudioComponent.name}::ctor`);

  }

  ngOnInit() {
    this.audio = this.initAudio();
    this.currentTime = this.service.formatTime(0);
    this.duration = this.service.formatTime(0);
  }

  ngAfterViewInit() {
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

    // // Subscribe other events
    // this.audio.addEventListener('playing', this.handleAudioPlayed);
    // this.audio.addEventListener('pause', this.handleAudioPaused);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.service.hasPropertyChanged(changes.src)) {
      this.loadAudioSource(changes.src.currentValue);
    }
  }

  ngOnDestroy() {
    // Unsubscribe
    this.timeSubscription.unsubscribe();
    this.loadSubscription.unsubscribe();

    // Destroy audio tag
    this.loadAudioSource('');
    this.audio.load();
  }

  public initAudio(): HTMLAudioElement {
    const audio = new Audio();
    audio['autobuffer'] = true;
    audio.autoplay = false;
    audio.preload = 'auto';

    return audio;
  }

  public loadAudioSource(src: string) {
    this.audio.pause();
    this.handleAudioPaused();
    this.audio.src = src;
  }

  public handleAudioLoaded = (e: HTMLMediaElementEventMap) => {
    this.duration = this.service.formatTime(this.audio.duration);
  }

  public handleAudioTimeUpdate = (e: HTMLMediaElementEventMap) => {
    this.currentTime = this.service.formatTime(this.audio.currentTime);
    this.onCurrentTimeUpdate.emit(this.audio.currentTime);
  }

  public handleAudioPlayed = () => {
    console.log('PLAY ORIGINAL');
    this.onPlayPause.emit(true);
    this.isPlaying = true;
  }

  public handleAudioPaused = () => {
    console.log('PAUSA ORIGINAL');
    this.onPlayPause.emit(false);
    this.isPlaying = false;
  }

  public handleAudioPlayPause() {
    this.animates();
    // if (this.audio.paused) {
    //   this.audio.play();
    // } else {
    //   this.audio.pause();
    // }
  }

  public sketch() {
    const windows = <any>window;

    const self = this;
    // Sketch
    windows.Sketch.create(
      {
        particles: [],
        setup: function () {
          let analyser;
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
            // x = Math.random() * this.width;
            // y = Math.random() * this.height * 2;
            x = Math.random() * this.width;
            y = Math.random() * this.height * 2;
            particle = new Particle(x, y);
            // particle.energy = Math.random(particle.band / 256);
            this.particles.push(particle);
          }
          const audioAnalyser = self.audioAnalyserFun();
          if (audioAnalyser.enabled) {
            try {
              // setup the audio analyser
              analyser = new audioAnalyser(self.src, self.NUM_BANDS, self.SMOOTHING);
              // update particles based on fft transformed audio frequencies
              analyser.onUpdate = (bands) => {
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

              // start as soon as the audio is buffered
              analyser.start();
              document.body.appendChild(analyser.audio);
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
          } else {

            // Web Audio API not detected
            warning = document.getElementById('warning1');
            return warning.style.display = 'block';
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

  public audioAnalyserFun() {
    const self = this;
    class AudioAnalysers {
      private w = <any>window;
      private audio;
      private numBands;
      private smoothing;
      private context;
      private jsNode;
      private analyser;
      private bands;
      private source;
      private onUpdate;
      public AudioContext = w.AudioContext || w.webkitAudioContext;
      enabled = null;

      constructor(audio = new Audio(), numBands = 256, smoothing = 0.3) {
        let src;
        this.audio = audio;
        this.numBands = numBands;
        this.smoothing = smoothing;
        const windows = <any>window;
        this.AudioContext = windows.AudioContext || windows.webkitAudioContext;

        this.enabled = windows.AudioContext != null;

        // construct audio object
        if (typeof this.audio === 'string') {
          src = this.audio;
          this.audio = new Audio();
          this.audio.crossOrigin = 'anonymous';
          this.audio.controls = true;
          this.audio.src = src;
        }

        // setup audio context and nodes
        // const audioAnalyser = <any>self.audioAnalyserFun;
        this.context = new this.AudioContext();

        // createScriptProcessor so we can hook onto updates
        this.jsNode = this.context.createScriptProcessor(2048, 1, 1);

        // smoothed analyser with n bins for frequency-domain analysis
        this.analyser = this.context.createAnalyser();
        this.analyser.smoothingTimeConstant = this.smoothing;
        this.analyser.fftSize = this.numBands * 2;

        // persistant bands array
        this.bands = new Uint8Array(this.analyser.frequencyBinCount);
        // circumvent http://crbug.com/112368
        this.audio.addEventListener('canplay', () => {

          // Subscribe other events
          this.audio.addEventListener('playing', () => {
            console.log('PLAY');
            self.onPlayPause.emit(true);
            self.isPlaying = true;
            self.audio.play();
          });
          this.audio.addEventListener('pause', () => {
            console.log('PAUSA');
            self.onPlayPause.emit(false);
            self.isPlaying = false;
            self.audio.pause();
          });
          // media source
          this.source = this.context.createMediaElementSource(this.audio);
          // wire up nodes
          this.source.connect(this.analyser);
          this.analyser.connect(this.jsNode);
          this.jsNode.connect(this.context.destination);
          this.source.connect(this.context.destination);
          // update each time the JavaScriptNode is called
          return this.jsNode.onaudioprocess = () => {
            // retreive the data from the first channel
            this.analyser.getByteFrequencyData(this.bands);
            if (!this.audio.paused) {
              return typeof this.onUpdate === 'function' ? this.onUpdate(this.bands) : void 0;
            }
          };
        });
      }

      start() {
        return this.audio.play();
      }

      stop() {
        return this.audio.pause();
      }
    }
    const prueba = <any>AudioAnalysers;
    const w = <any>window;
    prueba.AudioContext = w.AudioContext || w.webkitAudioContext;

    prueba.enabled = prueba.AudioContext != null;

    return prueba;
  }

}
