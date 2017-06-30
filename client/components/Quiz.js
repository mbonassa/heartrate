import React from 'react';
import FireBaseTools, { firebaseUsersRef, firebaseQuizRef, firebaseAuth } from '../../utils/firebase.js';
import anime from 'animejs'
import { Link, browserHistory } from 'react-router';

export default class Quiz extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: {},
            userData: {},
            current: 0,
            questionNumbers: [],
            latestMatchKey: '',
            finishedQuiz: false
        }
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount () {
        firebaseQuizRef.on('value',
            (snapshot) => {
                this.setState({
                  data: snapshot.val()
                })
            },
            (errorObject) => {
                console.error('The read failed: ' + errorObject.code)
            })
        firebaseAuth.onAuthStateChanged((user) => {
            if (user){
            firebaseUsersRef.child(firebaseAuth.currentUser.uid).on('value',
                (snapshot) => {
                    this.setState({userData: snapshot.val()})
                    let max = 0;
                    let latestMatchKey;
                    let matchKeys = Object.keys(snapshot.val().matches).forEach(key => {
                        let timestamp = snapshot.val().matches[key].timestamp;
                        if (timestamp > max) {
                            max = timestamp;
                            latestMatchKey = key;
                        }
                    })
                    //Load finishedQuiz to state
                    data.child('matches').child(latestMatchKey).on('value',
                        (snapshot) => {
                            let finishedQuiz = snapshot.val().finishedQuiz;
                            let questionNumbers = snapshot.val().numbers.split(',');
                            this.setState({finishedQuiz, latestMatchKey, questionNumbers});
                        })
                },
                (errorObject) => {
                    console.error('The read failed: ' + errorObject.code)
                })
            } else {
                browserHistory.push('login')
            }
        });

        function swipe () {
            var el = document.querySelector('#question-title');
            var domNode = anime({
              targets: el,
              translateX: 250,
              duration: 5000,
              delay: 500
            });
        }
        swipe();


    }

    handleClick(event) {
        let user = firebaseAuth.currentUser.uid;
        let matchRef = firebaseUsersRef.child(user).child('matches');
        let questionNumber = +this.state.questionNumbers[this.state.current];
        let answerNumber = Number(event.target.id);
        let latestMatchKey;

        if (this.state.latestMatchKey.length) {
            latestMatchKey = this.state.latestMatchKey;
        }
        matchRef.child(latestMatchKey).child('round1').update({
            [questionNumber]: [answerNumber]
        })
        let current = this.state.current +1;
        this.setState({current});

    }

    render() {
        let questionNumbers = this.state.questionNumbers;
        let question = questionNumbers ? this.state.data[questionNumbers[this.state.current]] : null;

        return (
            <div>
            {this.state.finishedQuiz ?
            <h1 href='/pickquestion'>Go to Round 2</h1>
            :
            this.state.current < 4 ?
            <div className="quiz">
                <h1 id="question-title">{question ? question[0] : null}</h1>
                <div id="answers">
                    <a onClick={this.handleClick}><div className="answer"><h3 className="answer-text" id="1">{question ? question[1] : null}</h3></div></a>
                    <a onClick={this.handleClick}><div className="answer"><h3 className="answer-text" id="2">{question ? question[2] : null}</h3></div></a>
                    <a onClick={this.handleClick}><div className="answer"><h3 className="answer-text" id="3">{question ? question[3] : null}</h3></div></a>
                    <a onClick={this.handleClick}><div className="answer"><h3 className="answer-text" id="4">{question ? question[4] : null}</h3></div></a>
                </div>
            </div> :
            <div className="quiz">
                <h1 id="question-title">{question ? question[0] : null}</h1>
                <div id="answers">
                    <Link to='/waiting' className="answer-text"><div className="answer"><h3 className="answer-text" id="1">{question ? question[1] : null}</h3></div></Link>
                    <Link to='/waiting' className="answer-text"><div className="answer"><h3 className="answer-text" id="2">{question ? question[2] : null}</h3></div></Link>
                    <Link to='/waiting' className="answer-text"><div className="answer"><h3 className="answer-text" id="3">{question ? question[3] : null}</h3></div></Link>
                    <Link to='/waiting' className="answer-text"><div className="answer"><h3 className="answer-text" id="4">{question ? question[4] : null}</h3></div></Link>
                </div>
            </div>
            }
            </div>
            )
    }

}
