import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { PlayerService } from './player.service';
import { Song } from '../songs/song.interface';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnChanges {
  @Input() currentSong: Song;
  public points: number = 0;
  public lines: string[] = [];
  public onLyricsTimeUpdate = new EventEmitter<number>();
  public onSpeechStart = new EventEmitter<boolean>();
  private readonly POINTS_MULTIPLIER = 5;

  constructor(private playerService: PlayerService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.playerService.hasPropertyChanged(changes.currentSong)) {
      this.resetPlayer();
    }
  }

  public resetPlayer() {
    console.log(`${PlayerComponent.name}::resetPlayer`);

    this.points = 0;
    this.lines = [];
  }

  public handleAudioPlayPause(isPlaying: boolean) {
    console.log(`${PlayerComponent.name}::handleAudioPlayPause`);
    this.onSpeechStart.emit(isPlaying);
  }

  public handleAudioTimeUpdate = (time: number) => {
    this.onLyricsTimeUpdate.emit(time);
  }

  public handleLyricsNewLine = (current) => {
    const newLines = [current.line].concat(this.lines).slice(0, 5);

    const count = current.line.split(' ').length;
    console.log(`${PlayerComponent.name}::handleLyricsNewLine cantidad %o`, count);
    // Keep up to last 5 lines in array
    this.lines = newLines;
  }

  public handleSpeechFound(text: string) {
    console.log(`${PlayerComponent.name}::handleSpeechFound [speech match]: %o`, text);

    const matches = this.playerService.countMatches(text, this.lines);
    this.points += (matches * this.POINTS_MULTIPLIER);
  }

}
