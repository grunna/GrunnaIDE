'use strict'

const PATH = require('path');
const Env = use('Env')
const DockerImage = use('App/Models/DockerImage')
const Template = use('App/Models/Template')

class InitDbValues {
  async dockerImages () {
    const node10 = new DockerImage()
    node10.name = 'node:10'
    node10.description = 'Node 10'
    await node10.save()
    const node12 = new DockerImage()
    node12.name = 'node:12'
    node12.description = 'Node 12'
    await node12.save()
    const node13 = new DockerImage()
    node13.name = 'node:13'
    node13.description = 'Node 13'
    await node13.save()
    const openjdk8 = new DockerImage()
    openjdk8.name = 'openjdk:8'
    openjdk8.description = 'OpenJDK 8'
    await openjdk8.save()
    const openjdk11 = new DockerImage()
    openjdk11.name = 'openjdk:11'
    openjdk11.description = 'OpenJDK 11'
    await openjdk11.save()
    const golang113 = new DockerImage()
    golang113.name = 'golang:1.13'
    golang113.description = 'Go Lang 1.13'
    await golang113.save()
    const python38 = new DockerImage()
    python38.name = 'python:3.8'
    python38.description = 'Python 3.8'
    await python38.save()
    const ruby27 = new DockerImage()
    ruby27.name = 'ruby:2.7'
    ruby27.description = 'Ruby 2.7'
    await ruby27.save()
    const mono68 = new DockerImage()
    mono68.name = 'mono:6.8'
    mono68.description = 'Mono 6.8'
    await mono68.save()
  }
  
  async templates() {
    
  }
}

module.exports = InitDbValues
