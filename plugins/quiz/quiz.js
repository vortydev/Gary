var Discord = require("discord.js"),
    request = require("request"),
    fs = require('fs');

var self = this;
self.client = null;
self.logger = null;

const channelNamePath = './plugins/quiz/channel.txt';

var prefix = null;
var quizChannelName = '';
var currentQuiz = null;
var correctAnswer = null;
var participantsAnsweredQuestion = 0;

exports.commands = [
    "quiz"
]

exports.init = function (client, config, _, logger) {
    self.client = client;
    self.logger = logger;
    prefix = config.prefix;

    if (fs.existsSync(channelNamePath)) {
        fs.readFile(channelNamePath, 'utf8', (err, data) => {
            if (err) {
                self.logger.logError(err);
                return;
            }

            // Remove line breaks
            quizChannelName = data.replace(/(\r\n|\n|\r)/gm," ");
            if (quizChannelName == '') {
                self.logger.logStr('quiz channel not set. See README');
                return;
            }

            self.logger.logStr('quiz channel set to: ' + quizChannelName);
        });
    } else {
        self.logger.logStr('quiz channel not set. See README');
    }
}

// Commands
exports['quiz'] = {
    usage: 'Start a quiz with `quiz start [number of players]`',
    process: function (message, args) {
        console.log(quizChannelName);
        if (message.channel.name != quizChannelName) {
            message.reply('please use **#' + quizChannelName + '**')
                .then(m => m.delete(5000))
                .catch(console.error);
            return;
        } else {
            self.logger.logStr('couldn\'t find channel: ' + quizChannelName);
        }
        
        //If no argument was provided, send help and return.
        if (args[0] == null) {
            console.log('send help');
            sendHelp(message);
            return;
        }

        //Quiz commands
        switch (args[0].toLowerCase()) {
            case "start": {
                //You cannot start a quiz if one is already open.
                
                if (currentQuiz != null) {
                    console.log('quiz already in progress');
                    message.reply("the quiz is already in progress.")
                        .then((msg) => { msg.delete(2000) })
                        .catch((error) => { console.log(error) });
                    return;
                }

                //You just provide the 'numOfParticipants' argument.
                if (args[1] == null) {
                    console.log('incorrect syntax');
                    message.reply("the correct syntax is `" + prefix + "quiz start [numOfParticipants].`")
                        .then((msg) => { msg.delete(2000) })
                        .catch((error) => { console.log(error) });
                    return;
                }

                //Generates quiz and sends feedback to user.
                generateQuiz(args[1], 10); 
                message.channel.send("**A " + args[1] + " player quiz with 10 questions has been created**\nUse `" + prefix + "quiz join` to join it.");
                break;
            }
            case "join": {
                //You cannot join if a quiz has not been created yet.
                if (currentQuiz == null) {
                    message.reply("the quiz has not been created yet.")
                        .then((msg) => { msg.delete(2000) })
                        .catch((error) => { console.log(error) });
                    return;
                }

                //You cannot join if the quiz has already started.
                if (currentQuiz.started) {
                    message.reply("the quiz has already started.")
                        .then((msg) => { msg.delete(2000) })
                        .catch((error) => { console.log(error) });
                    return;
                }

                //You cannot join if you have already joined.
                var x = null;
                for (var i = 0; i < currentQuiz.participants.length; i++) {
                    if (currentQuiz.participants[i].id == message.author.id)
                        x = currentQuiz.participants[i];
                }
                if (x != null) {
                    message.reply("you have already joined this quiz.")
                        .then((msg) => { msg.delete(2000) })
                        .catch((error) => { console.log(error) });
                }

                //Create participant.
                var participant = {
                    id: message.author.id,
                    score: 0,
                    lastAnswer: "",
                    lastScoreModifider: 0,
                    answeredCurrentQuestion: false
                };

                //Add participant created to the database and send feedback.
                currentQuiz.participants.push(participant);
                message.reply("quiz successfully joined. Waiting for " + (currentQuiz.participantsToStart - currentQuiz.participants.length) + " more players to start the quiz.")
                    .then((msg) => { msg.delete(2000) })
                    .catch((error) => { console.log(error) });

                //Check if we have enough players to start the quiz.
                if (currentQuiz.participantsToStart == currentQuiz.participants.length)
                    beginQuiz(message);
                break;
            }
            case "answer": {
                //You cannot answer if a question has not been asked
                if (correctAnswer == null || currentQuiz == null) {
                    message.reply("a question has not been asked yet.")
                        .then((msg) => { msg.delete(2000) })
                        .catch((error) => { console.log(error) });
                    return;
                }
                
                //You must provide a choice
                if (args[1] == null) {
                    message.reply("correct usage is `" + prefix + "quiz answer [letter]`")
                        .then((msg) => { msg.delete(2000) })
                        .catch((error) => { console.log(error) });
                    return;
                }

                var choice = args[1].toLowerCase();

                //Get the participant
                var participant = null;

                for (var i = 0; i < currentQuiz.participants.length; i++) {
                    if (currentQuiz.participants[i].id == message.author.id)
                        participant = currentQuiz.participants[i];
                }

                //You cannot answer if you have not entered.
                if (participant == null) {
                    message.reply("you have not yet entered this quiz.")
                        .then((msg) => { msg.delete(2000) })
                        .catch((error) => { console.log(error) });
                    return;
                }

                //You cannot answer if you have already answered.
                if (participant.answeredCurrentQuestion) {
                    message.reply("you have already answered this question.")
                        .then((msg) => { msg.delete(2000) })
                        .catch((error) => { console.log(error) });
                    return;
                }

                //You cannot answer with a choice other than 'A', 'B', 'C' or 'D'
                if (choice != 'a' && choice != 'b' && choice != 'c' && choice != 'd') {
                    message.reply("please use `" + prefix + "quiz answer a`, `" + prefix + "quiz answer b`, `" + prefix + "quiz answer c` or `" + prefix + "quiz answer b`")
                        .then((msg) => { msg.delete(2000) })
                        .catch((error) => { console.log(error) });
                    return;
                }

                //Generate scoremodiier between 'max' and 'min'.
                var max = -1;
                var min = -1000;
                var scoreModifier = Math.floor(Math.random() * (max - min + 1)) + min;

                //If we got it correct, change the scoremodifier to +1.
                if (choice == correctAnswer)
                    scoreModifier = 1;

                //Set participant variables
                participant.score += scoreModifier;
                participantsAnsweredQuestion += 1;
                participant.lastAnswer = choice.toUpperCase();
                participant.lastScoreModifier = scoreModifier;
                participant.answeredCurrentQuestion = true;

                if (participantsAnsweredQuestion == currentQuiz.participants.length)
                    revealAnswer(message);
                break;
            }
            case "help": {
                sendHelp(message);
                break;
            }
        }
    }
};

function sendHelp(message) {
    var result = "";

    result += "`quiz start [players]` - Starts a quiz\n";
    result += "`quiz join` - Joins a quiz\n";
    result += "`quiz answer [A/B/C/D]` - Answers a question\n";
    result += "`quiz help` - Get quiz commands\n";

    var embed = new Discord.RichEmbed()
        .setColor(0x7a7a7a)
        .setTitle('Quiz Commands')
        .setDescription(result)
        .setThumbnail(self.client.user.avatarURL)
        .setFooter('For additional help, contact TheV0rtex#4553')
        .setTimestamp();

    message.author.send({embed})
}

function beginQuiz(message) {
    //Make sure no-one else can join
    currentQuiz.started = true;

    //Send feedback to the user
    message.channel.send("**THE QUIZ IS STARTING**");

    //Ask the first question
    askQuestion(message);
}

function askQuestion(message) {

    //Get the current question
    var question = currentQuiz.questions[currentQuiz.currentQuestion];

    //Create the richembed and set the title
    var embed = new Discord.RichEmbed()
        .setTitle("**Question #" + (currentQuiz.currentQuestion + 1) + "**");

    var q = question.question;

    q = q.replace(/&quot;/g, '"');
    q = q.replace(/&#039;/g, "'");

    //Make the text variable
    var text = q + "\n\n";

    //Create array of answers and shuffle
    var answers = [question.correct_answer, question.incorrect_answers[0], question.incorrect_answers[1], question.incorrect_answers[2]];
    shuffle(answers);

    //Add answers to 'text'
    text += "**A** " + answers[0] + "\n";
    text += "**B** " + answers[1] + "\n";
    text += "**C** " + answers[2] + "\n";
    text += "**D** " + answers[3] + "\n";
    text += "\nAnswer with `" + prefix + "quiz answer [letter]`";

    //Find out which letter is the correct answer (we forgot in the shuffling)
    var correct_Answer = "";

    for (var i = 0; i < answers.length; i++) {
        if (answers[i] == question.correct_answer) {
            if (i == 0)
                correct_Answer = "a";
            if (i == 1)
                correct_Answer = "b";
            if (i == 2)
                correct_Answer = "c";
            if (i == 3)
                correct_Answer = "d";
        }
    }

    //Set the description
    embed.setDescription(text);

    //Send the embed
    message.channel.send({ embed });

    //Set the correct answer and increment the current question counter
    correctAnswer = correct_Answer;
    currentQuiz.currentQuestion++;
}

function revealAnswer(message) {

    //Create embed and set the title and description.
    var embed = new Discord.RichEmbed()
        .setTitle("**Question Over**")
        .setDescription("The correct answer was `" + correctAnswer.toUpperCase() + "`");

    //Set the answer counter to 0.
    participantsAnsweredQuestion = 0;

    //Leaderboard text variable.
    var text = "";

    var sorted = currentQuiz.participants;
    sorted.sort(function (a, b) { return a.score - b.score });

    //Populate leaderboard.
    for (var i = 0; i < sorted.length; i++) {
        //Get user from participant id.
        var user = self.client.users.get(currentQuiz.participants[i].id);

        //Add the username and their last answer.
        text += "#" + (i + 1) + " - " + user.username + " | **" + currentQuiz.participants[i].lastAnswer + "** | ";

        //Add positive sign.
        if (currentQuiz.participants[i].lastScoreModifier > 0)
            text += "+";

        //Add last score modifier.
        text += currentQuiz.participants[i].lastScoreModifier + " (Total ";

        //Add positive sign.
        if (currentQuiz.participants[i].score > 0)
            text += "+";

        //Add the total points.
        text += currentQuiz.participants[i].score + " Points)\n";
    }

    //Add the leaderboard field to the embed.
    embed.addField("**Leaderboard**", text);

    //Send the embed
    message.channel.send({embed});

    //Reset 'participant.answeredQuestion' value
    for (var i = 0; i < currentQuiz.participants.length; i++) {
        currentQuiz.participants[i].answeredCurrentQuestion = false;
    }

    //If we still have a question to go, ask another one.
    if (currentQuiz.currentQuestion < currentQuiz.totalQuestions) {
        askQuestion(message);
        return;
    }

    //If we dont, then reset all the quiz variables.
    currentQuiz = null;
    correctAnswer = null;
    participantsAnsweredQuestion = 0;
}

function generateQuiz(participantsToStart, numOfQuestions) {

    var url = "https://opentdb.com/api.php?amount=" + numOfQuestions + "&category=15&difficulty=hard&type=multiple";
    var questions = null;

    //Get questions
    request({
        url: url,
        json: false
    }, function (error, response, body) {

        questions = JSON.parse(body).results;

        var quiz = {
            started: false,
            participants: [],
            participantsToStart: participantsToStart,
            totalQuestions: numOfQuestions,
            currentQuestion: 0,
            questions: questions
        };

        currentQuiz = quiz;
        }
    );
}

function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
