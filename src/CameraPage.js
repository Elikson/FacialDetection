import React, { Component } from 'react'
import { Text, View, StyleSheet, TouchableOpacity, ImageBackground, Dimensions } from 'react-native'
import { RNCamera } from 'react-native-camera';

var faceIdOne = null;
var faceIdTwo = null;

const window = Dimensions.get('window');

const apiURL = null
const authKey = null


export default class CameraPage extends Component {

    constructor(props){
        super(props)

        this.state = {
            imageOneSeted: null,
            imageTwoSeted: null,
            faceResult: ''
        }
    }

    render() {
        var imageOne = this.state.imageOneSeted
        var imageTwo = this.state.imageTwoSeted
        var faceResult = this.state.faceResult

        return (
            <View style={styles.content}>
                <RNCamera
                    ref={ref => {
                        this.camera = ref;
                    }}
                    style={styles.preview}
                    type={RNCamera.Constants.Type.front}
                    flashMode={RNCamera.Constants.FlashMode.off}
                    androidCameraPermissionOptions={{
                        title: 'Permissão de câmera',
                        message: 'Precisa de acesso a sua câmera pra funcionar',
                        buttonPositive: 'Ok',
                        buttonNegative: 'Cancel',
                    }}
                >
                    <View style={{ flex: 1, opacity: 0.6 }}>
                        <ImageBackground
                            style={{
                                width: window.width,
                                height: 70,
                                alignItems: 'center',
                                justifyContent: 'space-around'
                            }}
                            source={require('./imgs/circuitos.jpg')}
                        >
                            <Text style={{ opacity: 4.0, fontSize: 24, color: '#ffffff', fontWeight: 'bold' }}>
                                App reconhecimento facial
                            </Text>
                        </ImageBackground>
                    </View>
                    <View style={{ flex: 0.5, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: 'white', fontSize: 34 }}>
                            { faceResult }
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                        <ImageBackground style={{
                            width: 85,
                            height: 110,
                            alignSelf: "center",
                            marginTop: 80
                        }} source={{uri: imageOne}}>
                        </ImageBackground>

                        <ImageBackground style={{
                            width: 85,
                            height: 110,
                            alignSelf: "center",
                            marginTop: 80,
                            marginLeft: 20
                        }} source={{uri: imageTwo}}>
                        </ImageBackground>
                    </View>
                    <TouchableOpacity onPress={this.takePicture.bind(this)} style={styles.capture}>
                        <Text style={{ fontSize: 14 }}> CAPTURAR </Text>
                    </TouchableOpacity>
                </RNCamera>
            </View>
        )
    }

    takePicture = async () => {
        var self = this;
        if (this.camera) {
            const options = { quality: 0.5, base64: true };
            const data = await this.camera.takePictureAsync(options);

            const localFile = await fetch(data.uri);
            const fileBlob = await localFile.blob();

            console.log("OK1 ",localFile)
            console.log("OK2 ",data.uri)
            if(self.state.imageOneSeted == null){
                self.setState({ imageOneSeted: data.uri })

                fetch(apiURL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/octet-stream',
                        'Ocp-Apim-Subscription-Key': authKey
                    },
                    body: fileBlob,
                })
                .then((response) => response.json())
                .then((responseJson) => {
                    try{
                        faceIdOne = responseJson[0].faceId
                    }catch(e){}
                    //console.warn(responseJson)
                })
                .catch((error) => {
                //console.error(error);
                });

            }else if(self.state.imageTwoSeted == null){
                self.setState({ imageTwoSeted: data.uri })

                fetch(apiURL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/octet-stream',
                        'Ocp-Apim-Subscription-Key': authKey
                    },
                    body: fileBlob,
                })
                .then((response) => response.json())
                .then((responseJson) => {
                    try{
                        faceIdTwo = responseJson[0].faceId
                    }catch(e){}
                    //console.warn(faceIdTwo)
                    this.verifyPerson()
                })
                .catch((error) => {
                //console.error(error);
                });

            }else{
                self.setState({ faceResult: '' })
                self.setState({ imageTwoSeted: null })
                self.setState({ imageOneSeted: null })
            }

        }
    };

    verifyPerson = () => {
        var self = this
        if(faceIdOne == null || faceIdTwo == null){
            self.setState({ faceResult: "Pessoas diferentes" })
        }else{
            fetch('https://westcentralus.api.cognitive.microsoft.com/face/v1.0/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Ocp-Apim-Subscription-Key': '3275c18a07db4670938f07cd0e3dddd2'
                },
                body: JSON.stringify({
                    "faceId1" : faceIdOne,
                    "faceId2": faceIdTwo
                }),
            })
            .then((response) => response.json())
            .then((responseJson) => {
                //console.warn(responseJson)
                if(responseJson.isIdentical){
                    //console.warn("Mesma pessoa")
                    self.setState({ faceResult: "Mesma pessoa" })
                }else{
                    //console.warn("Pessoas diferentes")
                    self.setState({ faceResult: "Pessoas diferentes" })
                }
            })
            .catch((error) => {
                self.setState({ faceResult: "Pessoas diferentes" })
                //console.warn("Pessoas diferentes")
                //console.error(error);
            });
        }
        
    }
    
}

const styles = StyleSheet.create({
    content: {
        width: '100%',
        height: '100%'
    },
    preview: {
        flex: 1,
        width: '100%',
        height: '100%'
      },
    capture: {
        flex: 0,
        backgroundColor: 'cyan',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20,
    },
  });