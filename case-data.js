/*
 * THE MARCHETTI CASE — interrogation content.
 *
 * Everything the room renders lives here: the case file, the evidence chain,
 * the three suspects and every line they can say. Adding a question is just
 * adding an object to a `questions` array — no HTML or CSS changes needed.
 *
 *   question.requires  — evidence id that must be unlocked before it appears
 *   question.reveals   — evidence ids unlocked by asking it
 *   question.tension   — how much composure the question costs the suspect
 *   question.rapport   — minimum rapport (from cigarette/water) to unlock
 */

window.CASE = {
  title: 'The Marchetti Case',
  subtitle: 'Homicide — 14 Cavendish Row',
  victim: 'Elena Marchetti, 34 — gallery owner',
  found: 'Study, 11:20 PM. Blunt force trauma.',
  weapon: 'A bronze award statuette missing from the study shelf.',

  briefing:
    "Elena Marchetti died in her own study on a Tuesday night, in a house with the alarm armed and three other people inside. The perimeter was sealed at nine and nobody crossed it until the first car arrived. That means the person who killed her ate dinner with her. All three of them are lying to you. Only one of them is lying about the murder.",

  timeline: [
    { time: '9:00 PM', event: 'Perimeter alarm armed. No entry or exit logged for the rest of the night.' },
    { time: '9:40 PM', event: 'Heavy rain begins. Continuous until 1 AM.' },
    { time: '10:05 PM', event: 'Elena takes a seven-minute call in the study. Her solicitor.' },
    { time: '10:15 PM', event: 'Kitchen kettle boils.' },
    { time: '10:20 PM', event: 'Wine cellar door opens — Adrian Marchetti’s code.' },
    { time: '10:31 PM', event: 'Storm knocks out power. Router down. Four minutes.' },
    { time: '10:35 PM', event: 'Power restored.' },
    { time: '10:38 PM', event: 'Wine cellar door closes.' },
    { time: '10:44 PM', event: 'A message is composed on Elena’s laptop. Never sent.' },
    { time: '10:47 PM', event: 'Elena’s watch records its final heartbeat.' },
    { time: '11:20 PM', event: 'Emergency call placed from the house.' },
  ],

  /* ---------------------------------------------------------------- evidence
   * source: 'file' items are available from the start.
   * 'lab' items arrive in order, one per call on the desk phone.
   * 'testimony' items are unlocked only by what the suspects say.
   */
  evidence: [
    {
      id: 'watch', source: 'file', name: 'Smartwatch telemetry',
      detail: 'Elena’s watch logged a final heartbeat at 10:47 PM and flatlined. Time of death is not an estimate in this case. It is a timestamp.',
    },
    {
      id: 'email', source: 'file', name: 'Unsent message — 10:44 PM',
      detail: '"I know about the Vermeer certificate. I’m taking it to the board tomorrow morning. I’m sorry, P. I have to." Composed three minutes before she died. Never sent.',
    },
    {
      id: 'cellar', source: 'lab', name: 'Wine cellar lock log',
      detail: 'The cellar door is a smart lock. Adrian’s code opened it at 10:20 PM and closed it at 10:38 PM. Eighteen minutes — not the "close to eleven" he gave in his statement.',
    },
    {
      id: 'router', source: 'lab', name: 'Network session log',
      detail: 'The outage at 10:31 PM dropped every device in the house. Priya’s video call to Pune terminated at 10:31 and was never re-established. Her call did not run until eleven. It ran until half past ten.',
    },
    {
      id: 'kettle', source: 'lab', name: 'Kitchen kettle log',
      detail: 'The kettle boiled once that night: 10:15 PM. Teresa says she made the tea at quarter past eleven. The tray she carried up was stone cold, and the log says why.',
    },
    {
      id: 'shoes', source: 'lab', name: 'Footwear analysis — A. Marchetti',
      detail: 'Wet grass, silt and lawn soil pressed into the welt of Adrian’s shoes. The composition matches the strip of lawn outside the study’s garden door. It had been raining for over an hour.',
    },
    {
      id: 'vermeer', source: 'lab', name: 'Authentication certificate',
      detail: '"Vermeer, study of a woman at a window" — certified genuine, signed P. Raghunathan. The painting is a forgery. The £900,000 sale settled into Marchetti Holdings, not the gallery.',
    },
    {
      id: 'debt', source: 'lab', name: 'Marchetti Holdings — accounts',
      detail: '£1.4 million in undisclosed debt with a balloon payment due at the end of the month. The Vermeer money covered a fraction of it. Elena going to the board would have ended him.',
    },
    {
      id: 'garden', source: 'testimony', name: 'The garden door',
      detail: 'The study opens onto the lawn through a garden door that sits on a separate circuit from the perimeter alarm. It was never armed. A person could step outside and come back in without leaving a single trace in the log. The koi pond is twelve metres from that door.',
    },
    {
      id: 'motion', source: 'lab', name: 'Interior motion sensors',
      detail: 'Study wing: one entry at 10:41 PM, then the garden door opens at 10:49 PM and closes at 10:51 PM. Kitchen corridor: continuous movement from 10:34 to 10:58 PM. Pantry: no movement at all between 10:16 and 11:14 PM.',
    },
    {
      id: 'pond', source: 'lab', name: 'Koi pond recovery',
      detail: 'The bronze statuette, under sixty centimetres of water and silt, twelve metres from the garden door. Elena’s blood in the seam of the base. Thrown, not dropped — it was four metres from the near bank.',
    },
  ],

  culprit: 'adrian',

  /* ---------------------------------------------------------------- suspects */
  suspects: [
    {
      id: 'adrian',
      name: 'Adrian Marchetti',
      role: 'Husband — property developer, 41',
      seat: '#1c2534',
      avatar: {
        skin: '#c68e63', shade: '#a97449', hair: '#1f1b18', hairStyle: 'slick',
        cloth: '#243247', clothDark: '#1a2434', shirt: '#e8e6e1', build: 'broad',
      },
      opening:
        "\"I've told the other two officers all of this. I'll tell you as well, and then I'd like to sit with my wife.\"",
      offers: {
        cigarette: "\"...Yes. Thank you.\" He takes it, lights it, and his hands are steadier afterwards than they were before.",
        water: "\"No. Thank you.\" He looks at the glass for a moment longer than the answer needed.",
      },
      press:
        "\"You keep asking me the same thing in different clothes. I was in my own house. My wife is dead in my own house. What exactly is it you think you're circling?\"",
      breakLine:
        "\"All right. ALL RIGHT.\" His hand goes flat on the table. \"I went into the garden. The study door. Five minutes, no more — she was on the phone, she was tearing into someone, and I could not be in that room. So I stood in the rain like an idiot and then I came back in. That's the grass. That's all the grass is.\"",
      breakReveals: ['garden'],
      questions: [
        { id: 'a1', text: 'Walk me through your evening.', tension: 2,
          answer: "\"We ate at eight. Elena was quiet — she'd been quiet for weeks, and I'd stopped asking. Afterwards I went down to the cellar to find something for the weekend. I was down there a long while. It's the only room in that house where nobody can reach you.\"" },
        { id: 'a2', text: 'How long were you in the cellar?', tension: 4,
          answer: "\"Forty minutes. Closer to an hour, maybe. There's no clock down there and I wasn't in a hurry.\"" },
        { id: 'a3', text: 'The lock says you came out at 10:38.', requires: 'cellar', tension: 14, reveals: [],
          answer: "\"Then the lock is wrong.\" A pause, one beat too long. \"Or I've misremembered. It was the worst night of my life. You'll forgive me if the minutes have gone soft.\"" },
        { id: 'a4', text: 'Where were you at 10:47?', requires: 'watch', tension: 16,
          answer: "\"Upstairs. The hall. I don't know — I wasn't standing there timing myself while my wife—\" He stops. \"I was in the house. Somewhere in the house.\"" },
        { id: 'a5', text: 'There was wet grass in your shoes.', requires: 'shoes', tension: 15,
          answer: "\"I stepped out for air at some point in the evening. That isn't a crime in this country yet.\"" },
        { id: 'a6', text: 'It had been raining hard since twenty to ten.', requires: 'shoes', tension: 12,
          answer: "\"Then I stepped out into the rain. People do strange small things in bad marriages, Inspector. Standing in the wet is one of the more harmless ones.\"" },
        { id: 'a7', text: 'Tell me about the Vermeer.', requires: 'vermeer', tension: 10,
          answer: "\"That was Elena's world. I build flats. I couldn't tell you a Vermeer from a postcard and I've never pretended otherwise.\"" },
        { id: 'a8', text: 'Nine hundred thousand of it landed in your company.', requires: 'vermeer', tension: 18,
          answer: "He takes a long breath through his nose. \"A loan drawn against a receivable. It's ordinary. It is the single most ordinary thing in commercial property and you can ask any accountant in this city.\"" },
        { id: 'a9', text: 'You are one point four million in debt.', requires: 'debt', tension: 20,
          answer: "\"Every developer alive is in debt. It's called leverage. You people hear a number and you hear a motive — I hear a Tuesday.\"" },
        { id: 'a10', text: 'She was going to the board in the morning.', requires: 'email', tension: 24,
          answer: "\"Is that what she told you?\" Very quiet now. \"She's dead. She didn't tell anybody anything. Whatever you think you're holding, she never got to send it.\"" },
        { id: 'a11', text: 'Did you love your wife?', tension: 6,
          answer: "\"That is an obscene question and you know it is.\" He holds the look. \"Yes. Badly. For nineteen years.\"" },
        { id: 'a12', text: 'Who do you think did this?', tension: 3,
          answer: "\"Teresa has keys to every room in that house and a bottle in the pantry she thinks nobody's counted. Or Priya — Elena had found something out about Priya, she'd been on the phone about it for a week. Start there. Start anywhere but here.\"" },
        { id: 'a13', text: 'Why did you not call for help when you found her?', requires: 'garden', tension: 22,
          answer: "\"Because I didn't find her.\" His jaw sets. \"Teresa found her. I was in the hall. I heard Teresa scream and I came down and by then there was nothing left to do that mattered.\"" },
      ],
    },

    {
      id: 'priya',
      name: 'Priya Raghunathan',
      role: 'Best friend — art authenticator, 36',
      seat: '#2a1c22',
      avatar: {
        skin: '#c98a5e', shade: '#a86f47', hair: '#241a16', hairStyle: 'bob',
        cloth: '#6b2733', clothDark: '#4d1c26', shirt: '#efe7dd', build: 'slim',
      },
      opening:
        "\"Ask me properly. Don't do the thing where you're kind to me for ten minutes first — I've known Elena since we were seventeen and I would rather you just asked.\"",
      offers: {
        cigarette: "\"I stopped in 2011.\" A beat. \"Leave it there anyway.\"",
        water: "She takes it with both hands and doesn't drink any of it. \"Thank you. Sorry. Thank you.\"",
      },
      press:
        "\"You think I don't know what this looks like. I know precisely what it looks like. I've spent my whole career looking at things and saying whether they're what they claim to be.\"",
      breakLine:
        "\"I WAS IN THE HALL.\" It comes out of her all at once. \"The call died with the power and I went down for a candle and I was in the kitchen corridor and I saw him — Adrian — come through from the study side at about ten to eleven with rain in his hair and his collar soaked through. And I said nothing. For four days I have said nothing. Because I signed that certificate and I knew the second I opened my mouth you would look at me and stop looking anywhere else.\"",
      breakReveals: ['garden'],
      questions: [
        { id: 'p1', text: 'Where were you when it happened?', tension: 2,
          answer: "\"The guest room, on a video call with my sister in Pune. It's the only hour of the week our clocks agree with each other.\"" },
        { id: 'p2', text: 'Until when?', tension: 4,
          answer: "\"Eleven. About eleven — I didn't watch the clock, we were talking about our mother.\"" },
        { id: 'p3', text: 'The power died at 10:31. So did your call.', requires: 'router', tension: 16,
          answer: "A long silence. \"...Then it ended at 10:31. I'm not going to sit here and argue with a router.\"" },
        { id: 'p4', text: 'So where were you from half past ten?', requires: 'router', tension: 18,
          answer: "\"I went downstairs to find a candle. The house was black and I don't know where anything is kept in that kitchen, so I was down there a while. Longer than it should take to find a candle.\"" },
        { id: 'p5', text: 'You signed the Vermeer certificate.', requires: 'vermeer', tension: 20,
          answer: "\"I did.\" She says it flatly, the way you put something heavy down. \"I have signed four hundred and eleven certificates in fourteen years. That one I should not have signed.\"" },
        { id: 'p6', text: 'Why did you sign it?', requires: 'vermeer', rapport: 1, tension: 14,
          answer: "\"Because Adrian asked me to. And because he had something of mine he could have handed to Elena whenever he chose.\" She looks up. \"It wasn't money. I want that on your paper. He never offered me a penny.\"" },
        { id: 'p7', text: 'Her last message was to you. "I\'m sorry, P."', requires: 'email', tension: 22,
          answer: "\"She knew. Of course she knew — she had the best eye in London and I'd insulted it.\" Her voice goes thin. \"And she was apologising. To ME. For what it was going to do to me when she told them. That is who she was and I want you to write that down as well.\"" },
        { id: 'p8', text: 'Did you see anyone while you were downstairs?', requires: 'router', tension: 12,
          answer: "She hesitates for a long moment. \"...The hall was dark. There were people moving in that house all night.\"" },
        { id: 'p9', text: 'Was anyone wet?', requires: 'shoes', tension: 18,
          answer: "\"Why would anyone be wet.\" It isn't a question. She looks at the table. \"It was raining like the end of the world outside.\"" },
        { id: 'p10', text: 'Why did you not say any of this on the night?', requires: 'router', tension: 15,
          answer: "\"Because the moment I say I was downstairs, I was downstairs. With a forged certificate in my name and no one to say otherwise. You'd have had me by breakfast and you know it.\"" },
        { id: 'p11', text: 'How long had you known her?', tension: 2,
          answer: "\"Nineteen years.\" A small, wrecked smile. \"She was the only person I've ever met who would tell you the truth to your face and then stay in the room afterwards.\"" },
        { id: 'p12', text: 'Do you think Adrian killed her?', tension: 8,
          answer: "\"I think Adrian has never once absorbed a loss he could hand to somebody else. Not a bad quarter, not a bad decision, not a bad marriage.\" A pause. \"Make of that what you like. I'm not a witness to it.\"" },
      ],
    },

    {
      id: 'teresa',
      name: 'Teresa Alvarez',
      role: 'Housekeeper — nineteen years in service, 52',
      seat: '#22241c',
      avatar: {
        skin: '#b98055', shade: '#9a6640', hair: '#4a4340', hairStyle: 'tied',
        cloth: '#3b4034', clothDark: '#2b2f26', shirt: '#dfd9cc', build: 'soft',
      },
      opening:
        "\"I have worked in that house nineteen years. I found her. Please — whatever you need to ask, ask it, but I would like to not say the word again.\"",
      offers: {
        cigarette: "She shakes her head quickly. \"Mrs Marchetti did not allow it in the house.\" Then, quieter: \"I do not know why I said that. She is not going to mind now.\"",
        water: "She takes the glass and drinks half of it without stopping, and only then seems to notice she was thirsty. \"Thank you. Thank you, sir.\"",
      },
      press:
        "\"You are asking me like I am a thief.\" Her hands are flat on the table, pressed down hard. \"Nineteen years. Nineteen years in that house and you are asking me like I am a thief.\"",
      breakLine:
        "\"I WAS ASLEEP.\" It bursts out of her and she immediately covers her mouth. \"...I had two glasses of the cooking wine and I sat down in the pantry chair and I fell asleep like an old woman and I woke up at a quarter past eleven and the tea was stone cold. So I made it again and I carried it up as if nothing — as if I had been awake the whole time — and she was on the floor and she had been on the floor for an hour while I—\" She cannot finish it.",
      breakReveals: [],
      questions: [
        { id: 't1', text: 'Tell me what you found.', tension: 3,
          answer: "\"The study door was open, which it never is at that hour. She was by the desk. I did not touch her, I did not touch anything, I called on the kitchen telephone because my hands would not work the mobile.\"" },
        { id: 't2', text: 'What time was that?', tension: 4,
          answer: "\"Twenty past eleven. I looked at the clock on the wall because I knew — I don't know how I knew — that somebody would ask me this exact question.\"" },
        { id: 't3', text: 'You were bringing tea.', tension: 3,
          answer: "\"Every night at eleven. Nineteen years, every night, whether she drank it or not.\"" },
        { id: 't4', text: 'The kettle boiled at quarter past ten.', requires: 'kettle', tension: 16,
          answer: "A long silence. Her eyes go to the corner of the table. \"...The kettle in that house is very old.\"" },
        { id: 't5', text: 'It logs to the network. It boiled once.', requires: 'kettle', tension: 20,
          answer: "\"Then it says what it says.\" Barely audible. \"I am not going to call a kettle a liar to a policeman.\"" },
        { id: 't6', text: 'The tea you carried up was cold.', requires: 'kettle', tension: 18,
          answer: "\"I made it early. Sometimes I make it early.\" Her hands have started to shake and she puts them under the table." },
        { id: 't7', text: 'Where were you between ten and eleven?', tension: 14,
          answer: "\"In the pantry. Sorting the linen for the morning.\"" },
        { id: 't8', text: 'For an entire hour?', tension: 18,
          answer: "\"It is a very big house and there is a great deal of linen.\" She does not look up when she says it." },
        { id: 't9', text: 'Did you hear anything at all?', tension: 6,
          answer: "\"The rain. Only the rain. That house is very quiet and the rain that night was very loud, and I have thought about that every hour since.\"" },
        { id: 't10', text: 'Did you see Mr Marchetti that evening?', tension: 8,
          answer: "\"Not after dinner. I am not upstairs at that hour and he does not come to the back of the house.\"" },
        { id: 't11', text: 'Was Mrs Marchetti happy?', tension: 4,
          answer: "\"She was frightened.\" She says it without hesitating, the first thing all night she hasn't weighed. \"Not of a person. Of something she had found out. There is a difference and I saw it on her every day for two weeks.\"" },
        { id: 't12', text: 'Who had keys to the study?', tension: 5,
          answer: "\"Everybody. It was never locked. She used to say that locking doors inside your own home is a sickness.\" A pause. \"I have thought about that also.\"" },
      ],
    },
  ],

  /* ---------------------------------------------------------------- verdicts */
  verdicts: {
    adrian: {
      correct: true,
      title: 'Adrian Marchetti',
      body: [
        "He told you he was in the cellar until close to eleven. The lock says he came out at 10:38. The study wing registers a single entry three minutes later, at 10:41.",
        "Elena's watch stops at 10:47. At 10:49 the garden door — the one door in that house on its own circuit, the one door that never got armed — opens, and closes again at 10:51. Twelve metres away, under sixty centimetres of water, the statuette with her blood in the seam of the base. It was four metres from the near bank. Nobody drops something four metres from a bank.",
        "The lawn came back into the house in the welt of his shoes, and Priya saw him come through from the study side at ten to eleven with rain in his hair.",
        "At 10:44 Elena wrote that she was taking the Vermeer certificate to the board in the morning. He was one point four million down with a balloon payment at the end of the month. She was three minutes from the end of her life and she was still apologising to her friend for what the truth was going to cost her.",
      ],
    },
    priya: {
      correct: false,
      title: 'Priya Raghunathan',
      body: [
        "She lied to you, and she lied badly — the call died with the power at 10:31 and she let you believe it ran to eleven.",
        "But the kitchen corridor sensor has her moving continuously from 10:34 to 10:58, on the opposite side of the house from the study, across the whole window in which Elena died. She cannot be in two wings at once.",
        "What she was hiding was the certificate with her name on it, and the fact that she watched Adrian come in soaking wet and said nothing for four days. That is cowardice and it is fraud. It is not this.",
      ],
    },
    teresa: {
      correct: false,
      title: 'Teresa Alvarez',
      body: [
        "She lied about the tea, and the kettle log caught her doing it — 10:15, not 11:15.",
        "She lied because she had two glasses of cooking wine and fell asleep in the pantry chair, and the pantry sensor confirms it: no movement at all between 10:16 and 11:14. She was motionless in a chair through the entire hour that mattered.",
        "Her lie was about being asleep on a job she'd done for nineteen years. She has been punishing herself for it far more efficiently than you ever could.",
      ],
    },
  },
};
