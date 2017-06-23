import Expo from 'expo';
import React from 'react';
import { StyleSheet, Text, View, Button, Image } from 'react-native';
import FireBaseTools, { firebaseUsersRef } from '../utils/firebase';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-around',
    flexDirection: 'column'
  },
});

export default class UserView extends React.Component{
  constructor(props){
    super(props)
    this.state = {val: ''}
  }

  componentDidMount(){
    firebaseUsersRef.child('User1').on("value",
      (snapshot) => {
      this.setState({val: snapshot.val()});
    },
      (errorObject) => {
      console.log("The read failed: " + errorObject.code);
    });
  }

  render() {
    console.log('image', this.state.val.imageUrl)
      return (
      <View style={styles.container}>
        <View>

        <View style={{
          justifyContent: 'space-between',
          flexDirection: 'row'
        }}>
          <Image
            source={require('../assets/icons/house.jpg')}
            style={{width:50, height: 50}} />
            <Text>Despacito</Text>
          <Image
            source={require('../assets/icons/speech_bubble.png')}
            style={{width:50, height: 50}} />
        </View>

          <Image
            source={{uri: this.state.val.imageUrl}}
            style={{width: 300, height: 500, zIndex: 0}} />
          <Text>{this.state.val.name}, {this.state.val.age}</Text>
          <Text>{this.state.val.bio}</Text>

        <View style={{
          justifyContent: 'space-between',
          flexDirection: 'row'
        }}>
          <Image
            source={require('../assets/icons/broken_heart.png')}
            style={{width:50, height: 50}} />
          <Image
            source={require('../assets/icons/heart_eyes.png')}
            style={{width:50, height: 50}} />
        </View>
        </View>
      </View>
      )
  }
}