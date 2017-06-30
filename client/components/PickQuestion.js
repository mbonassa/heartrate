// import React from 'react';
// import FireBaseTools, { firebaseUsersRef, firebaseQuestionsRef, firebaseQuizRef, firebaseAuth } from '../../utils/firebase.js';

// export default class Quiz extends React.Component {
//     constructor(props) {
//         super(props)
//         this.state = {
//             questions: {},
//             matchKey: '',
//             randomNumbers: [],
//             theirName: '',
//             heartStatus: 0,
//             turnToAsk: false,
//             questionsAnswered: 0
//         }
//         this.handleClick = this.handleClick.bind(this);
//     }


//     componentDidMount () {
//         firebaseAuth.onAuthStateChanged((user) => {
//             if (user) {
//                 firebaseQuestionsRef.on('value',
//                     (snapshot) => {
//                         this.setState({questions: snapshot.val()})
//                         let arr = [];
//                         while (arr.length < 4) {
//                             let random = Math.round(Math.random() * Object.keys(snapshot.val()).length) + 1;
//                             if (arr.indexOf(random) === -1) arr.push(random)
//                         }
//                         this.setState({randomNumbers: arr})
//                     },
//                     (errorObject) => {
//                         console.error('The read failed: ' + errorObject.code)
//                     })

//                 let user = firebaseAuth.currentUser.uid;
//                 let userRef = firebaseUsersRef.child(user)

//                 //We obtain an object with all the user's matches from the database
//                 //We preserve this object to state on allMatches
//                 //Then, we find the most recent match by comparing timestamps
//                 userRef.child('matches').on("value", (snapshot) => {
//                     this.setState({allMatches: snapshot.val()})
//                         let max = 0;
//                         let matchKey;
//                         let matchKeys = Object.keys(snapshot.val()).forEach(key => {
//                             let timestamp = snapshot.val()[key].timestamp;
//                             if (timestamp > max) {
//                                 max = timestamp;
//                                 matchKey = key;
//                             }})
//                             //Getting heartStatus with latest match
//                             //Finding out if it's your turn to ask with match
//                             let matchData = snapshot.val()[matchKey];
//                             let heartStatus = matchData.heartStatus;
//                             let turnToAsk = matchData.turnToAsk;
//                             let myAnsweredQuestions = Object.keys(matchData.round2answers).length;
//                             //Getting name of match and number of answered questions
//                                 //Getting name of match and number of answered questions
//                                 firebaseUsersRef.child(matchKey).on('value', (snapshot) => {
//                                     let theirAnsweredQuestions = Object.keys(snapshot.val().matches[user].round2answers).length;
//                                     let theirName = snapshot.val().name;
//                                     let questionsAnswered = myAnsweredQuestions + theirAnsweredQuestions;
//                                     //Make sure that if match is lost, that gets persisted to the db for both users
//                                     if (questionsAnswered > 5 && heartStatus < 5) {
//                                         userRef.child('matches').child(matchKey).update({
//                                             lost: true
//                                         })
//                                         let user = firebaseAuth.currentUser.uid;
//                                         firebaseUsersRef.child(matchKey).child('matches').child(user).update({
//                                             lost: true
//                                         })
//                                     }
//                                     this.setState({theirName, matchKey, heartStatus, turnToAsk, questionsAnswered})
//                                 })

//                 },
//                 (errorObject) => {
//                     console.error('The read failed: ' + errorObject.code)
//                 });
//             } 
//         });




//     }

//     handleClick (n) {
//         let user = firebaseAuth.currentUser.uid;
//         let userRef = firebaseUsersRef.child(user)
//         let matchKey = this.state.matchKey;
//         let questionNumber = this.state.randomNumbers[n]
//         //This is the database reference to the latest (current) match's match object
//         firebaseUsersRef.child(matchKey).child('matches').child(user).child('round2').update({
//             //We affix a timestamp to each question so later we can be sure to get the latest one
//             [questionNumber]: 'true,' + Date.now()
//         })
//         //Update turnToAsk from true to false
//         userRef.child('matches').child(matchKey).update({
//             turnToAsk: false
//         })
//     }

//     render() {
//         console.log('PickQuestion :', this.state)
//         //If your match's turnToAsk is false, that means that they have just picked a question, so link should appear to Answer
//         return (
//         <div>
//             <img className="logo-top" src="./img/sm-logo.png" />
//             {this.state.questionsAnswered == 6 && this.state.heartStatus < 5 ?
//             <h1>You lost the match!</h1>
//             :
//             <div>
//                 {this.state.turnToAsk && this.state.heartStatus < 5 ?
//                 <div>
//                     <div>{this.state.theirName.length ? <h1>Pick a question to send to {this.state.theirName}!</h1> : null}</div>
//                     <a href='/viewanswer'><h3 onClick={() => this.handleClick(0)}>{this.state.questions[this.state.randomNumbers[0]]}</h3></a>
//                     <a href='/viewanswer'><h3 onClick={() => this.handleClick(1)}>{this.state.questions[this.state.randomNumbers[1]]}</h3></a>
//                     <a href='/viewanswer'><h3 onClick={() => this.handleClick(2)}>{this.state.questions[this.state.randomNumbers[2]]}</h3></a>
//                 </div>
//                 :
//                 <div>
//                 {this.state.heartStatus >= 5 ?
//                 <div>
//                     <h1>You and {this.state.theirName} have accumulated {this.state.heartStatus} hearts!</h1>
//                     <h2>You've won the game, and the privilege to talk to your partner! What are you waiting for?!</h2>
//                     <a><h2>Go Chat!</h2></a>
//                 </div>
//                 :
//                 <div>
//                     <h1>It's not your turn to pick a question!</h1>
//                     <a href='/answer'><h2>Go answer one instead</h2></a>
//                 </div>
//             }
//             </div>
//         }
//         </div>
//         }
//     </div>
//     )
//     }

// }


import React from 'react';
import { Link } from 'react-router';
import FireBaseTools, { firebaseUsersRef, firebaseQuestionsRef, firebaseQuizRef, firebaseAuth } from '../../utils/firebase.js';
export default class Quiz extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            allUsers: '',
            userMatches: ''
        }
        this.matchObj = {},
        this.partnerInfo = {},
        this.partnerId = '',
        this.partnerMatch = {},
        this.questionsAnswered = '',
        this.handleClick = this.handleClick.bind(this);
    }
    componentDidMount () {
        firebaseAuth.onAuthStateChanged((user) => {
            if (user){
                let userRef = firebaseUsersRef.child(firebaseAuth.currentUser.uid);
                //We obtain an object with all the user's matches from the database
                //We preserve this object to state on allMatches
                //Then, we find the most recent match by comparing timestamps
                firebaseUsersRef.on('value', snapshot => {
                    this.setState({allUsers: snapshot.val()}, () => {
                        this.partnerInfo = this.state.allUsers.partnerId || {}
                        this.partnerMatch =
                        this.state.allUsers.partnerId && this.state.allUsers.partnerId.matches.userId || {}
                        this.questionsAnswered = 0 // tbd
                    });
                });
                userRef.on('value', (snapshot) => {
                        this.setState({userInfo: snapshot.val()}, () => {
                        this.partnerId = this.state.userInfo.partnerId;
                        this.matchObj = this.state.userInfo.matches[this.partnerId] || {};
                    });
                });
            }
        });
        firebaseQuestionsRef.on('value',
            (snapshot) => {
                this.setState({questions: snapshot.val()})
                let arr = [];
                while (arr.length < 4) {
                    let random = Math.round(Math.random() * Object.keys(snapshot.val()).length) + 1;
                    if (arr.indexOf(random) === -1) arr.push(random)
                }
                this.setState({randomNumbers: arr})
            },
            (errorObject) => {
                console.error('The read failed: ' + errorObject.code)
        });
    }
    handleClick (n) {
        let matchKey = this.partnerId;
        let questionNumber = this.state.randomNumbers[n]
        //This is the database reference to the latest (current) match's match object
        firebaseUsersRef.child(matchKey).child('matches').child('User4').child('round2').update({
            //We affix a timestamp to each question so later we can be sure to get the latest one
            [questionNumber]: 'true,' + Date.now()
        })
        //Update turnToAsk from true to false
        if (firebaseAuth.currentUser.uid) firebaseUsersRef.child(firebaseAuth.currentUser.uid).child('matches').child(matchKey).update({
            turnToAsk: false
        })
    }
    render() {
        return (
            <div>
            {
                this.questionsAnswered == 6 && this.matchObj.heartStatus < 5 ?
                // to-do ^^^^^
                <h1>You lost the match!</h1>
                :
                <div>
                    {this.matchObj.turnToAsk && this.matchObj.heartStatus < 5 ?
                    <div>
                        <div>{(this.state.allUsers[this.partnerId]).length ?
                        <h1>Pick a question to send to {this.state.theirName}!</h1> : null}</div>
                        <Link to='/viewanswer'><h3 onClick={() => this.handleClick(0)}>{this.state.questions[this.state.randomNumbers[0]]}</h3></Link>
                        <Link to='/viewanswer'><h3 onClick={() => this.handleClick(1)}>{this.state.questions[this.state.randomNumbers[1]]}</h3></Link>
                        <Link to='/viewanswer'><h3 onClick={() => this.handleClick(2)}>{this.state.questions[this.state.randomNumbers[2]]}</h3></Link>
                    </div>
                    :
                    <div>
                    {this.matchObj.heartStatus >= 5 ?
                    <div>
                        <h1>You and {this.partnerInfo.name} have accumulated {this.matchObj.heartStatus} hearts!</h1>
                        <h2>You've won the game, and the privilege to talk to your partner! What are you waiting for?!</h2>
                        <a><h2>Go Chat!</h2></a>
                         <Link to={
                            {
                            pathname:`/chat/${this.partnerId}`,
                            state: {partnerInfo: this.partnerInfo}
                            }
                        }> Chat </Link>
                    </div>
                    :
                    <div>
                        <h1>It's not your turn to pick a question!</h1>
                        <Link to='/answer'><h2>Go answer one instead</h2></Link>
                    </div>
                }
                </div>
            }
            </div>
        }
        </div>
        )
    }
}
