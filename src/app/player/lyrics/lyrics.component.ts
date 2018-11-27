import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Subscription } from 'rxjs';
import * as LRC from 'lrc.js';
import * as $ from 'jquery';

import { LyricLRC } from './LyricLRC.interface';
import { PlayerService } from '../player.service';

export interface Line {
  index: number;
  text: string;
}

@Component({
  selector: 'app-player-lyrics',
  templateUrl: './lyrics.component.html',
  styleUrls: ['./lyrics.component.css']
})
export class LyricsComponent implements OnInit, OnDestroy, OnChanges {

  @Input() src: string = 'assets/songs/face-it/face-it.mp3';
  @Input() delay: number = 0;
  @Input() onCurrentTimeUpdate: EventEmitter<number>;
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onLoad = new EventEmitter();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onNewLine = new EventEmitter<any>();
  private timeSubscription: Subscription;
  public lyrics: LyricLRC;
  public currentLineIndex: number = -1;
  public lines: Line[] = [];
  public activateHighlight: boolean = false;
  public countEmit = 0;

  private cc = 0;
  private fulltext = [];
  // private nextWord;
  private text;
  private textBody;
  private words;

  // private MP3_PATH = 'https://api.soundcloud.com/tracks/42328219/stream?client_id=b1495e39071bd7081a74093816f77ddb';

  constructor(
    private service: PlayerService,
    private http: Http) {
  }

  ngOnInit() {
    this.loadLyrics(this.src);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.service.hasPropertyChanged(changes.src)) {
      this.loadLyrics(changes.src.currentValue);
    }
  }

  ngOnDestroy() {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
  }

  loadLyrics(src) {
    console.log(`${LyricsComponent.name}::handleToggle`);

    this.http
      .get(src)
      .subscribe((response: Response) => {
        this.processLyrics(response.text());
        this.timeSubscription = this.onCurrentTimeUpdate.subscribe(this.handleUpdateTime);
      });
  }

  public processLyrics(lrcText) {
    console.log(`${LyricsComponent.name}::handleToggle`);

    this.lyrics = LRC.parse(lrcText);
    this.currentLineIndex = -1;
    this.lines = [];
    this.onLoad.emit();
  }

  public handleUpdateTime = (currentTime: number) => {
    this.getCurrentLine(currentTime);
  }

  public getCurrentLine = (currentTime: number) => {

    currentTime += this.delay;
    const { lines } = this.lyrics;
    const lineIndex = lines.findIndex((line) => (line.time >= currentTime));
    const previousLine = lines[this.currentLineIndex];
    const nextLine = lines[lineIndex];
    const currentLineIndex = (lineIndex - 1);
    const currentLine = (lineIndex > 0)
      ? lines[currentLineIndex]
      : null;


    if (currentLine && currentLine !== previousLine) {
      this.activateHighlight = false;
      this.currentLineIndex = currentLineIndex;
      const timeDiff = nextLine !== undefined ? nextLine.time - currentLine.time : 0;
      this.onNewLine.emit({ line: currentLine.text, diff: timeDiff });
      this.countEmit = this.countEmit + 1;
      if (this.countEmit > 2) {
        this.highlightsProcess(currentLine.text, timeDiff);
      }
      this.activateHighlight = true;

      if (!this.lines.length) {
        this.lines.push({ index: currentLineIndex, text: currentLine.text });
      }

      if (nextLine) {
        const liness = this.lines.concat([{ index: lineIndex, text: nextLine.text }]);

        if (lines.length >= 4) {
          liness.shift();
        }

        this.lines = liness;
      }
    }
  }

  public paint = (text, spn, el, velocidad) => {
    $(spn).html(text);
    $(el).each(function (i, idx) {
      const sp = $(this);

      setTimeout(() => {
        sp.css('color', 'yellow');
      }, i * velocidad);
    });
  }


  public highlightsProcess(currentLine, timeDiff) {
    const words = currentLine.split(' ');
    console.log('highlightsProcess words %o', words);

    let l_count = words.length;
    let l_wrapped = '';

    const contadorTotal = l_count;

    words.forEach((el) => {
      // l_wrapped = l_wrapped.concat('<span class="letter">' + el + '</span>');
      l_wrapped = l_wrapped.concat(`<span class="letter"> ${el} </span>`);
      if (!--l_count) {
        // const tiempoIndividual = timeDiff / contadorTotal;
        const tiempoIndividual = timeDiff * 120;
        this.paint(l_wrapped, '.k-letters', '.letter', tiempoIndividual);
      }
    });
  }

}
