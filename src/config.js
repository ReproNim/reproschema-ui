module.exports = {
  githubSrc: process.env.VUE_APP_REPROSCHEMA_GITHUB_SRC || 'https://raw.githubusercontent.com/ReproNim/demo-protocol/main/DemoProtocol/DemoProtocol_schema',
  startButton: {
    "en": 'Join',
    "es": 'Participar'
  },
  assetsPublicPath: '/reproschema-ui/',
  backendServer: null,
  consent: true,
  showHelp: true,
  contact: 'voice_survey@mit.edu',
  emailSubject: 'Help with Covid19 study'
};

console.log(`Loading schema from VUE_APP_REPROSCHEMA_GITHUB_SRC: ${process.env.VUE_APP_REPROSCHEMA_GITHUB_SRC}`);