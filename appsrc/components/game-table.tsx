
import * as React from "react";
import {createStructuredSelector} from "reselect";

import {connect} from "./connect";

import {ILocalizer} from "../localizer";

import {IState, IFilteredGameRecord} from "../types";
import {IAction, dispatcher} from "../constants/action-types";
import * as actions from "../actions";

import {AutoSizer, Table, Column} from "react-virtualized";
import {IAutoSizerParams} from "./autosizer-types";

import NiceAgo from "./nice-ago";
import HiddenIndicator from "./hidden-indicator";
import TotalPlaytime from "./total-playtime";
import LastPlayed from "./last-played";

interface IRowGetterParams {
  index: number;
}

interface ICellRendererParams {
  cellData: IFilteredGameRecord;
  columnData: any;
  dataKey: string;
  isScrolling: boolean;
  rowData: any;
  rowIndex: number;
}

interface ICellDataGetter {
  columnData: any;
  dataKey: string;
  rowData: any;
}

class GameTable extends React.Component<IGameTableProps, void> {
  constructor() {
    super();
    this.rowGetter = this.rowGetter.bind(this);
    this.genericDataGetter = this.genericDataGetter.bind(this);

    this.coverRenderer = this.coverRenderer.bind(this);
    this.titleRenderer = this.titleRenderer.bind(this);
    this.publishedAtRenderer = this.publishedAtRenderer.bind(this);
    this.playtimeRenderer = this.playtimeRenderer.bind(this);
    this.lastPlayedRenderer = this.lastPlayedRenderer.bind(this);
  }

  rowGetter (params: IRowGetterParams): any {
    const {index} = params;

    return this.props.games[index];
  }

  genericDataGetter (params: ICellDataGetter): any {
    return params.rowData;
  }

  coverRenderer (params: ICellRendererParams): JSX.Element | string {
    const {cellData} = params;
    const {game} = cellData;
    return <div className="cover" style={{backgroundImage: `url("${game.stillCoverUrl || game.coverUrl}")`}}/>;
  }

  titleRenderer (params: ICellRendererParams): JSX.Element | string {
    const {cellData} = params;
    const {game} = cellData;
    return <div className="title-column" onClick={(e) => {
        this.props.navigateToGame(game);
      }}>
      <div className="title">{game.title}</div>
      <div className="description">{game.shortText}</div>
    </div>;
  }

  publishedAtRenderer (params: ICellRendererParams): JSX.Element | string {
    const {cellData} = params;
    const {game} = cellData;
    const {publishedAt} = game;
    if (publishedAt) {
      return <NiceAgo date={publishedAt}/>;
    } else {
      return "";
    }
  }

  playtimeRenderer (params: ICellRendererParams): JSX.Element | string {
    const {cellData} = params;
    const {game, cave} = cellData;

    if (cave) {
      return <TotalPlaytime game={game} cave={cave} short={true}/>;
    } else {
      return null;
    }
  }

  lastPlayedRenderer (params: ICellRendererParams): JSX.Element | string {
    const {cellData} = params;
    const {game, cave} = cellData;

    if (cave) {
      return <LastPlayed game={game} cave={cave} short={true}/>;
    } else {
      return null;
    }
  }

  render () {
    const {t, tab, games, hiddenCount} = this.props;

    return <div className="hub-games hub-game-table">
        <AutoSizer>
        {({width, height}: IAutoSizerParams) => {
          let remainingWidth = width;
          let coverWidth = 74;
          remainingWidth -= coverWidth;

          let publishedWidth = 140;
          remainingWidth -= publishedWidth;

          let playtimeWidth = 140;
          remainingWidth -= playtimeWidth;

          let lastPlayedWidth = 140;
          remainingWidth -= lastPlayedWidth;

          return <Table
              headerHeight={30}
              height={height}
              width={width}
              rowCount={games.length}
              rowHeight={75}
              rowGetter={this.rowGetter}
            >
            <Column
              dataKey="cover"
              width={coverWidth}
              cellDataGetter={this.genericDataGetter}
              cellRenderer={this.coverRenderer}/>
            <Column
              dataKey="title"
              label={t("table.column.name")}
              width={remainingWidth}
              cellDataGetter={this.genericDataGetter}
              cellRenderer={this.titleRenderer}/>
            <Column
              dataKey="secondsRun"
              label={t("table.column.play_time")}
              width={playtimeWidth}
              cellDataGetter={this.genericDataGetter}
              cellRenderer={this.playtimeRenderer}/>
            <Column
              dataKey="lastTouchedAt"
              label={t("table.column.last_played")}
              width={lastPlayedWidth}
              cellDataGetter={this.genericDataGetter}
              cellRenderer={this.lastPlayedRenderer}/>
            <Column
              dataKey="publishedAt"
              label={t("table.column.published")}
              width={publishedWidth}
              cellDataGetter={this.genericDataGetter}
              cellRenderer={this.publishedAtRenderer}/>
          </Table>;
        }}
      </AutoSizer>
      <HiddenIndicator tab={tab} count={hiddenCount}/>
    </div>;
  }
}

interface IGameTableProps {
  // specified
  games: IFilteredGameRecord[];
  hiddenCount: number;
  tab: string;

  filterQuery: string;
  onlyCompatible: boolean;

  t: ILocalizer;

  clearFilters: typeof actions.clearFilters;
  navigateToGame: typeof actions.navigateToGame;
}

const mapStateToProps = (initialState: IState, props: IGameTableProps) => {
  const {tab} = props;

  return createStructuredSelector({
    filterQuery: (state: IState) => state.session.navigation.filters[tab],
    onlyCompatible: (state: IState) => state.session.navigation.binaryFilters.onlyCompatible,
  });
};

const mapDispatchToProps = (dispatch: (action: IAction<any>) => void) => ({
  clearFilters: dispatcher(dispatch, actions.clearFilters),
  navigateToGame: dispatcher(dispatch, actions.navigateToGame),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(GameTable);
