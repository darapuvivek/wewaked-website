/*
 * Investigation room content. Add more cases, evidence, or suspects here —
 * the page renders whatever is in ACTIVE_CASE without needing HTML/CSS changes.
 * Evidence "shape" must be one of: folder, magnifier, photo, notepad, cup, phone, key.
 * Suspects are drawn as animated SVG portraits (built entirely in code, no
 * external images) — customize their look via the "avatar" trait object.
 */
window.CASES = [
  {
    id: 'blackout-heist',
    title: 'The Blackout Heist',
    location: 'Meridian Trust — Vault Level, 11:47 PM',
    victim: 'Meridian Trust (institutional loss)',
    timeOfIncident: '11:41 PM – 11:47 PM',
    synopsis:
      "Power cut out across the block at 11:41 PM. Six minutes later, the vault's ledger of untraceable holdings was gone. No forced entry. Three people had reason to want it gone, and one of them is lying.",
    narrative:
      "Meridian's backup generator has a documented six-second delay before it kicks in — a detail that isn't public. Whoever emptied the vault knew that window and used it. No alarms tripped, no locks were forced, and the only card that opened the vault that night had already been reported lost. That makes this an inside job, and it narrows the field to whoever had the access, the motive, and the nerve to move in the dark.",
    evidence: [
      {
        shape: 'folder',
        name: 'Vault Access Log',
        detail:
          "The badge log shows the vault opened once during the blackout window — on a keycard reported lost two days earlier. Whoever used it knew the backup generator delay to the second.",
      },
      {
        shape: 'photo',
        name: 'Muddy Print',
        detail:
          "A single boot print near the service stairwell, still wet when photographed. Tread pattern matches a work boot, not the dress shoes required by the bank's dress code.",
      },
      {
        shape: 'notepad',
        name: 'Torn Page',
        detail:
          "Half a page torn from a notepad, found in the stairwell bin. The remaining scrawl reads '...before the backup kicks in' — someone was timing the blackout, not reacting to it.",
      },
      {
        shape: 'cup',
        name: 'Cold Coffee',
        detail:
          "A full cup, stone cold, left on the security desk. The guard on duty swears he never left his post — but the coffee was poured at 11:20 PM, and no one drinks a full cup cold on purpose.",
      },
      {
        shape: 'phone',
        name: 'Burner Phone',
        detail:
          "Found wiped clean in a stairwell vent, except for one thing: a call placed at 11:38 PM, three minutes before the power died. The number traces to a payphone six blocks away.",
      },
      {
        shape: 'key',
        name: 'Spare Vault Key',
        detail:
          "A second, unregistered key that fits the vault's manual override. Only someone who'd had unsupervised time inside the vault could have had one cut.",
      },
    ],
    suspects: [
      {
        avatar: { skin: '#c98f65', hair: '#2b2420', hairStyle: 'short', clothing: '#2f3b47', clothingType: 'uniform', expression: 'stern' },
        name: 'Marcus Feld',
        role: 'Night Security Guard',
        suspicion: 4,
        statement:
          "\"I was at the desk the whole time. Power dropped, backup kicked in, I did my rounds like always. Ask anyone.\"",
        alibi:
          "Claims he never left the desk — but the cold coffee says otherwise, and the boot print matches his patrol boots.",
      },
      {
        avatar: { skin: '#e8c39e', hair: '#7a4a2b', hairStyle: 'bob', clothing: '#5c2b34', clothingType: 'blazer', expression: 'sharp' },
        name: 'Renata Cole',
        role: 'Senior Accountant',
        suspicion: 5,
        statement:
          "\"That ledger tracked money that technically shouldn't exist. I flagged it to compliance months ago. Nobody listened.\"",
        alibi:
          "Says she was home, but her badge shows her swiping into the building at 10:58 PM — she never mentioned coming in that night.",
      },
      {
        avatar: { skin: '#d9a86c', hair: '#181614', hairStyle: 'slick', clothing: '#3a3226', clothingType: 'blazer', expression: 'nervous' },
        name: 'Julian Voss',
        role: 'Client Relations, VIP Desk',
        suspicion: 3,
        statement:
          "\"I don't even have vault clearance. Whatever happened down there, it wasn't me.\"",
        alibi:
          "Clearance records confirm he's right — but he was seen near the payphone six blocks away earlier that evening.",
      },
    ],
  },
];

window.ACTIVE_CASE = window.CASES[0];
