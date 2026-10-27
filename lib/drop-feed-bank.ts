import type {Drill} from './drill-bank';
export const lessonCategories=["Contact & balance", "Placement & direction", "Spin & height", "Footwork & recovery", "Short-ball skills", "Challenges & review"];
const rows: [string,string,string,string][]=[
 [
  "Forehand contact window",
  "Player self-drops beside the front hip at the service line, lets one bounce rise, then hits to the opposite service box.",
  "Space the body from the bounce and meet the ball comfortably in front.",
  "7 of 10 balls in the diagonal service box."
 ],
 [
  "Backhand contact window",
  "Coach drops beside the player's backhand contact zone from outside the swing path; player hits after one bounce from the service line.",
  "Turn shoulders before the drop; maintain a balanced finish.",
  "7 of 10 backhands in the diagonal service box."
 ],
 [
  "Forehand balanced finish",
  "Self-drop at three-quarter court, hit through the middle, and hold the finish for two seconds.",
  "Let the rotation carry the finish; stay stable on landing.",
  "8 of 10 shots in court with a two-second balanced hold."
 ],
 [
  "Backhand balanced finish",
  "Coach drops to a comfortable backhand contact point at three-quarter court; hit deep middle and freeze.",
  "Keep the head quiet through contact and finish without falling sideways.",
  "8 of 10 stable finishes and 6 deep-middle shots."
 ],
 [
  "Forehand spacing steps",
  "Coach alternates drops half a step nearer and farther from the forehand hip; player adjusts before hitting.",
  "Use small steps instead of reaching or crowding the elbow.",
  "8 of 10 comfortable contacts; call cramped, stretched, or right after each."
 ],
 [
  "Backhand spacing steps",
  "Coach varies backhand drops slightly toward and away from the body at the service line.",
  "Move the feet to make room before swinging.",
  "8 of 10 contacts with clear space between hands and body."
 ],
 [
  "Forehand smooth acceleration",
  "Self-drop from three-quarter court and send a relaxed forehand through a large middle lane.",
  "Start smoothly and accelerate through contact without squeezing the handle.",
  "7 of 10 in the middle half with a relaxed finish."
 ],
 [
  "Backhand smooth acceleration",
  "Self-drop on the backhand side from three-quarter court and hit to a large central target.",
  "Use a connected shoulder turn rather than a sudden hand jab.",
  "7 of 10 controlled middle-half shots."
 ],
 [
  "Forehand crosscourt target",
  "Coach drops on the forehand side at three-quarter court; player hits into the far diagonal half beyond the service line.",
  "Choose a target well inside the sideline and finish toward the intended flight.",
  "6 of 10 in the deep diagonal half."
 ],
 [
  "Backhand crosscourt target",
  "Coach drops on the backhand side at three-quarter court; player sends every ball to the deep diagonal half.",
  "Set the racket early and keep space for extension.",
  "6 of 10 in the deep diagonal half."
 ],
 [
  "Forehand down the line",
  "From just inside the baseline, self-drop and hit down a lane one racket length inside the singles sideline.",
  "Align to the lane without forcing a last-second wrist change.",
  "6 of 10 inside the lane and beyond the service line."
 ],
 [
  "Backhand down the line",
  "Coach drops at the backhand contact zone just inside the baseline; player aims along a generous straight lane.",
  "Turn fully, arrive balanced, and extend through the target.",
  "6 of 10 legal down-the-line balls."
 ],
 [
  "Forehand deep middle",
  "Self-drop just inside the baseline and aim through the center third beyond the service line.",
  "Use height and smooth speed to make depth.",
  "7 of 10 deep-center landings."
 ],
 [
  "Backhand deep middle",
  "Coach drops for a backhand from just inside the baseline; player targets the center third deep.",
  "Lift through contact instead of steering with the hands.",
  "7 of 10 deep-center landings."
 ],
 [
  "Forehand short angle",
  "Coach drops near the forehand service-line corner; player shapes the ball into the opposite service box near its outer half.",
  "Reduce pace and create angle with a clear finish.",
  "6 of 10 in the outer half of the opposite service box."
 ],
 [
  "Backhand short angle",
  "Coach drops near the backhand service-line corner for a controlled diagonal angle.",
  "Keep the target generous; maintain balance rather than pulling away.",
  "6 of 10 in the outer half of the opposite service box."
 ],
 [
  "Two crosscourt, one line",
  "Coach gives three separate drops to the same groundstroke side; player hits crosscourt twice then down the line. Repeat on the other side.",
  "Reset feet and racket between each independent drop.",
  "Complete 3 of 5 three-ball patterns without a miss."
 ],
 [
  "Called direction",
  "Coach calls crosscourt or line before dropping to the forehand or backhand side.",
  "Choose the target before the bounce and keep the swing committed.",
  "8 of 10 correct choices and 6 target hits."
 ],
 [
  "Forehand topspin shape",
  "Self-drop at three-quarter court and brush upward toward a deep middle target with generous net clearance.",
  "Lower the racket below the contact point and swing up and through.",
  "7 of 10 clear the net with visible arc and land beyond the service line."
 ],
 [
  "Backhand topspin shape",
  "Coach drops from waist height to the backhand side; player builds an arcing deep reply.",
  "Bend through the legs and lift smoothly without leaning backward.",
  "7 of 10 arcing balls beyond the service line."
 ],
 [
  "Low forehand pickup",
  "Coach drops from knee height on the forehand side near the service line; player lifts after the low bounce.",
  "Lower the body and keep the racket face controlled.",
  "7 of 10 low pickups clear the net and land in court."
 ],
 [
  "Low backhand pickup",
  "Coach drops from knee height to the backhand side; player uses leg bend to lift the low bounce.",
  "Keep the chest steady and avoid scooping with the wrists.",
  "7 of 10 controlled low pickups in court."
 ],
 [
  "Higher-bounce forehand",
  "Coach uses a higher release that creates a comfortable chest-level bounce; player hits from three-quarter court.",
  "Adjust distance and contact height; do not force a shoulder-high strike if the bounce is lower.",
  "7 of 10 balanced contacts into the middle half."
 ],
 [
  "Higher-bounce backhand",
  "Coach releases higher on the backhand side to create a reachable higher bounce; player adjusts position.",
  "Prepare at the ball's height and avoid leaning back.",
  "7 of 10 balanced replies in court."
 ],
 [
  "Forehand slice feel",
  "Self-drop near the service line; use a compact forehand slice toward the opposite service box.",
  "Keep the face slightly open and move forward through the ball, not sharply down.",
  "6 of 10 controlled slices in the target box."
 ],
 [
  "Backhand slice feel",
  "Coach drops on the backhand side near the service line; player guides a compact slice toward a large deep target.",
  "Support the preparation, then maintain a stable racket face through contact.",
  "6 of 10 slices in court with controlled flight."
 ],
 [
  "Forehand step and hit",
  "Start one step behind the forehand drop spot; coach releases only when the player is ready to move in.",
  "Step into comfortable spacing before beginning the forward swing.",
  "8 of 10 balanced step-in contacts."
 ],
 [
  "Backhand step and hit",
  "Start one step behind the backhand contact spot; coach drops as the player moves into position.",
  "Lead with the turn and finish with weight moving through the shot.",
  "8 of 10 balanced step-in contacts."
 ],
 [
  "Forehand lateral adjustment",
  "Start at a center cone; move one or two steps right for a stationary coach drop, hit, then recover.",
  "Move first, adjust last, and regain a ready position.",
  "7 of 10 targets with recovery to the cone."
 ],
 [
  "Backhand lateral adjustment",
  "Start at a center cone; move one or two steps left to meet a coach drop, hit, and recover.",
  "Turn while moving and avoid crossing the feet during the final spacing step.",
  "7 of 10 targets with recovery to the cone."
 ],
 [
  "Alternating sides footwork",
  "Coach alternates stationary forehand and backhand drop spots a few steps apart; reset after each shot.",
  "Split into a ready stance on the coach's signal, then turn to the side.",
  "Complete 4 of 5 forehand/backhand pairs in court."
 ],
 [
  "Inside-out forehand setup",
  "Start near the backhand corner; move around a predictable coach drop and hit a forehand diagonally.",
  "Create enough space to the side and recover toward the court after contact.",
  "7 of 10 balanced inside-out forehands."
 ],
 [
  "Inside-in forehand setup",
  "Move around a coach drop near the backhand corner and target a generous straight lane.",
  "Get balanced before committing to the straighter target.",
  "6 of 10 inside-in shots inside the lane."
 ],
 [
  "Recover after the shot",
  "Coach drops at alternating contact spots; player hits deep middle and returns to the recovery marker before the next drop.",
  "Start recovery after the finish rather than watching the landing.",
  "8 of 10 complete hit-and-ready recoveries."
 ],
 [
  "Short forehand attack",
  "Coach drops inside the service line after the player moves forward from three-quarter court; hit to a deep corner.",
  "Arrive under control and use a large target instead of maximum pace.",
  "7 of 10 attacks in court with balanced follow-through."
 ],
 [
  "Short backhand attack",
  "Coach drops inside the service line on the backhand side; player moves forward and drives deep.",
  "Keep forward movement controlled and contact in front.",
  "7 of 10 controlled attacks in court."
 ],
 [
  "Forehand approach and split",
  "Coach drops a short forehand, player approaches down the line then split-steps at a marked transition zone on a clap.",
  "Recover the racket in front before the split; there is no incoming volley.",
  "6 of 10 approach targets plus balanced split-step."
 ],
 [
  "Backhand approach and split",
  "Coach drops a short backhand; player approaches to a large straight target and split-steps on the coach's signal.",
  "Move through the approach without running through contact.",
  "6 of 10 approach targets plus balanced split-step."
 ],
 [
  "Two-ball move forward",
  "Coach drops one ball at three-quarter court, then walks to a short-ball spot and drops only after the player arrives; hit deep then attack.",
  "Recognize the change in court position and shorten the second preparation.",
  "Complete 4 of 5 deep-then-short patterns."
 ],
 [
  "Forehand soft drop shot",
  "From inside the service line, coach drops a comfortable forehand; player sends it softly over the net into the short court.",
  "Use gentle touch with a stable face rather than a large chop.",
  "6 of 10 land in the first half of the opposite service box."
 ],
 [
  "Backhand soft drop shot",
  "Coach drops a comfortable backhand inside the service line; player uses compact touch toward a short target.",
  "Soften the grip and control the racket face through contact.",
  "6 of 10 land in the first half of the opposite service box."
 ],
 [
  "Attack or reset decision",
  "Coach chooses a deep or short drop station before the player moves; deep station means deep middle, short station allows a corner attack.",
  "Name reset or attack before swinging based on balance and position.",
  "8 of 10 sound decisions and 6 successful target shots."
 ],
 [
  "Forehand target ladder",
  "Self-drop from three-quarter court; earn three center targets before progressing to crosscourt, then a straight lane.",
  "Keep the same controlled swing as the target changes.",
  "Record the highest ladder level and total targets out of 15."
 ],
 [
  "Backhand target ladder",
  "Coach drops from three-quarter court; player earns three center targets, three crosscourt, then three down the line.",
  "Reset after each miss and rebuild direction from a balanced stance.",
  "Record the highest ladder level and total targets out of 15."
 ],
 [
  "Alternating depth challenge",
  "Coach drops at one comfortable contact spot; player alternates a service-box landing and a deep landing.",
  "Change swing size and shape while keeping contact spacing similar.",
  "Complete 3 of 5 short/deep pairs."
 ],
 [
  "Three-target circuit",
  "Choose middle, crosscourt, and line cones; coach drops to one groundstroke side as player cycles all three targets.",
  "Look at the next target before the drop and reset the feet.",
  "Complete 3 legal three-shot circuits; switch stroke halfway."
 ],
 [
  "Pressure five in a row",
  "Choose the weaker groundstroke; coach drops at a repeatable spot and player aims into the middle half.",
  "Keep the pre-shot breath and tempo consistent as the count rises.",
  "Reach five consecutive in-court targets and record the best streak."
 ],
 [
  "Drop-feed tiebreak",
  "Coach drops alternately to forehand and backhand; a target hit scores for the player and a miss scores for the challenge. First to seven, win by two.",
  "Treat each ball as a new point and name the target before the drop.",
  "Record score and target percentage; use generous deep-half targets."
 ],
 [
  "Choose your pattern",
  "Player chooses a three-shot sequence of direction and stroke; coach drops at the required stations, resetting between balls.",
  "Explain the purpose of the pattern and keep each contact balanced.",
  "Complete 3 of 5 chosen patterns and name one useful adjustment."
 ],
 [
  "Ten-ball skills check",
  "Coach gives five forehand and five backhand drops at agreed stations; player calls a target before each shot.",
  "Repeat the same routine and judge contact quality as well as the landing.",
  "Record forehand targets out of 5, backhand targets out of 5, and one focus for next lesson."
 ]
];
export const dropFeedBank:Drill[]=rows.map(([title,summary,cue,target],i)=>({id:101+i,title,summary,cue,target,category:lessonCategories[i<8?0:i<18?1:i<26?2:i<34?3:i<42?4:5],adjust:'Easier: move closer to the net, enlarge the target, and pause between drops. Harder: shrink the target or add one adjustment step after consistent success; change only one variable at a time.'}));
export function dropFeedText(d:Drill):string{return `Setup: ${d.summary} Use a basket and flat target markers. Coach stays outside the swing path; clear loose balls before each set. Every shot begins with a fresh vertical drop and one bounce, with no live rally. | Run: 0–1 min: demonstrate the contact and target; player shadows three repetitions. 1–3 min: six slow practice drops, resetting after each; give one correction using the coaching cue. 3–5 min: two sets of five scored drops using the target below; collect safely between sets. 5–6 min: collect balls and review the most common miss. 6–9 min: repeat scored sets, applying the easier or harder adjustment only if needed; record attempts as well as successes. 9–10 min: finish with five quality repetitions and note the result and next focus. | Coach: ${d.cue} | Target: ${d.target} | Adjust: ${d.adjust}`;}
