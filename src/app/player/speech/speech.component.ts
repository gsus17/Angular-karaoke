import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { fromEvent } from 'rxjs/observable/fromEvent';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/distinct';
import 'rxjs/add/operator/timeout';

import { RecognitionService } from './recognition.service';

@Component({
  selector: 'app-player-speech',
  templateUrl: './speech.component.html',
  styleUrls: ['./speech.component.css']
})
export class SpeechComponent implements OnInit, OnDestroy {

  @Input() playPause: EventEmitter<boolean>;
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSpeechFound = new EventEmitter<string>();
  private subscriptions: Subscription[] = [];
  private recognition: SpeechRecognition;
  public isAutoRestarting: boolean = false;
  public isRecording: boolean = false;

  constructor(private recognitionService: RecognitionService) { }

  ngOnInit() {
    this.recognition = this.recognitionService.getRecognition();
    const result$ = fromEvent(this.recognition, 'result');
    const start$ = fromEvent(this.recognition, 'start');
    const stop$ = fromEvent(this.recognition, 'stop');
    const end$ = fromEvent(this.recognition, 'end');

    const onStart = start$.subscribe(() => {
      // console.log('start')
      this.isRecording = true;

      result$.timeout(5000).subscribe(null, () => {
        if (this.isRecording) {
          // console.log('timeout, restarting...')
          this.isAutoRestarting = true;
          this.recognition.stop();
        }
      });
    });

    const onEnd = Observable.merge(stop$, end$).subscribe(() => {
      // console.log('stop or end?')
      if (this.isAutoRestarting) {
        this.isAutoRestarting = false;
        this.recognition.start();
      } else {
        this.isRecording = false;
      }
    });

    const onResult = result$
      .map((e: SpeechRecognitionEvent) => e.results[e.results.length - 1])
      .filter((result: SpeechRecognitionResult) => result.isFinal)
      .map((result: SpeechRecognitionResult) => result[0].transcript)
      .distinct()
      .subscribe((text: string) => {
        this.onSpeechFound.emit(text);
      });

    const onPlay = this.playPause
      .subscribe((isPlaying) => {
        if (isPlaying && !this.isRecording) {
          this.recognition.start();
        } else if (!isPlaying && this.isRecording) {
          this.recognition.stop();
        }
      });

    // So we can unsubscribe later
    this.subscriptions = this.subscriptions.concat([onStart, onEnd, onResult, onPlay]);
  }

  ngOnDestroy() {
    this.recognition.stop();
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public handleToggle() {
    console.log(`${SpeechComponent.name}::handleToggle`);

    if (!this.isRecording) {
      this.recognition.start();
    } else {
      this.recognition.stop();
    }
  }

}
