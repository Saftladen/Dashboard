import React from "react";
import B from "glamorous";
import {css} from "glamor";

let blink = css.keyframes({
  "50%": {opacity: 0},
});

const toSecs = d => Math.round(d.getTime() / 1000);

const Label = B.div({
  textAlign: "center",
  fontSize: "0.8em",
  marginBottom: "0.3em",
});

const TimeContainer = B.div({
  fontWeight: "bold",
  fontSize: "2em",
});

const fill = v => (v < 10 ? `0${v}` : v);

export default class Countdown extends React.Component {
  constructor(props) {
    super(props);
    // this.endsAt = toSecs(new Date()) + 1;
    this.endsAt = toSecs(new Date(this.props.data.ends_at));
    const now = toSecs(new Date());
    this.state =
      this.endsAt > now
        ? {
            status: "running",
            remainingSeconds: this.endsAt - now,
          }
        : {
            status: "finished",
          };
  }

  intervalId = null;
  alarmTimoutId = null;

  componentDidMount() {
    if (this.state.status !== "finished") {
      this.intervalId = setInterval(this.updateTime);
    }
  }

  componentWillUnmount() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.alarmTimoutId) clearTimeout(this.alarmTimoutId);
  }

  updateTime = () => {
    const remainingSeconds = this.endsAt - toSecs(new Date());
    if (remainingSeconds <= 0) {
      this.setState({remainingSeconds: 0, status: "alarming"});
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.alarmTimoutId = setTimeout(() => {
        this.setState({status: "finished"});
        this.alarmTimoutId = null;
      }, 10000);
    } else {
      this.setState({remainingSeconds});
    }
  };

  renderTime() {
    const {status, remainingSeconds} = this.state;
    if (status === "finished") {
      return <TimeContainer>Finished!</TimeContainer>;
    } else {
      const secs = remainingSeconds % 60;
      const totalMinutes = Math.floor(remainingSeconds / 60);
      const mins = totalMinutes % 60;
      const totalHours = Math.floor(totalMinutes / 60);
      return (
        <TimeContainer css={status === "alarming" ? {animation: `${blink} 0.5s infinite`} : null}>
          {fill(totalHours)}:{fill(mins)}:{fill(secs)}
        </TimeContainer>
      );
    }
  }

  render() {
    const {data} = this.props;
    return (
      <div>
        <Label>{data.label}</Label>
        {this.renderTime()}
      </div>
    );
  }
}
