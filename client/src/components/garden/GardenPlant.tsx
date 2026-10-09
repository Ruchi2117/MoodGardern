import { MOOD_PLANTS } from '../../../../shared/moods.js';
import type { Mood } from '../../services/api';
export const PLANT_POSITIONS = [[365,270],[490,258],[613,273],[420,291],[550,291],[660,289],[335,289],[465,313],[593,310],[390,313],[525,316],[635,309]];
export default function GardenPlant({ mood, x, y, newlyPlanted }: { mood: Mood; x: number; y: number; newlyPlanted: boolean }) {
 const { plantType, accent, displayName } = MOOD_PLANTS[mood];
 const isFlower = ['sunflower', 'pink-flower', 'sleepy-flower'].includes(plantType);
 return <g transform={`translate(${x} ${y})`} data-plant-type={plantType}>
  <title>{displayName}</title>
  {newlyPlanted && <g className="planting-seed"><ellipse cy="-5" rx="5" ry="8" fill="#866447"/><path d="M0-10V0" stroke="#c7a07b"/></g>}
  <g className={newlyPlanted ? 'new-garden-plant' : ''}><g className="scene-sprig">
   {plantType !== 'mushroom' && <><path d={plantType === 'sleepy-flower' ? 'M0 0Q0-44 15-48' : 'M0 0Q-4-22 0-49'} stroke="#71885d" strokeWidth="3" fill="none"/><path d="M0-14Q-24-31-19-13Q-11-5 0-14M0-25Q19-40 21-23Q11-17 0-25" fill="#91a77a"/></>}
   {isFlower && <g transform={plantType === 'sleepy-flower' ? 'translate(16 -45) rotate(35)' : 'translate(0 -51)'}>{[0,60,120,180,240,300].map(angle => <ellipse key={angle} cx="0" cy="-9" rx={plantType === 'sunflower' ? 5 : 7} ry="11" fill={accent} transform={`rotate(${angle})`}/>)}<circle r={plantType === 'sunflower' ? 8 : 5} fill={plantType === 'sunflower' ? '#96744c' : '#e5c875'}/>{plantType === 'sleepy-flower' && <path d="M-4 0q4 4 8 0" fill="none" stroke="#8d7c99" strokeWidth="1.5"/>}</g>}
   {plantType === 'lavender' && <g fill={accent}>{[-51,-59,-67,-75].map((height,index)=><g key={height}><ellipse cx={index % 2 ? -3 : 3} cy={height} rx="5" ry="6"/><ellipse cx={index % 2 ? 3 : -3} cy={height+3} rx="4" ry="5"/></g>)}</g>}
   {plantType === 'sprout' && <path d="M0-44Q-27-66-25-44Q-15-28 0-44M0-44Q27-67 25-45Q15-31 0-44" fill={accent}/>}
   {plantType === 'leafy-plant' && <g fill={accent}><path d="M0-44Q-31-49-21-65Q-2-65 0-44M0-42Q30-46 20-64Q3-62 0-42M0-48Q-15-83 0-87Q14-76 0-48"/></g>}
   {plantType === 'mushroom' && <><path d="M-6 0L-4-28H5L8 0Z" fill="#e9debc"/><path d="M-23-24Q-19-55 0-55Q21-52 24-24Q0-15-23-24Z" fill={accent}/><g fill="#f2e6ce"><circle cx="-9" cy="-36" r="4"/><circle cx="9" cy="-39" r="3"/><circle cy="-48" r="2"/></g></>}
  </g></g>
  {newlyPlanted && <g className="planting-sparkles" stroke="#c5ae72" strokeWidth="1.5"><path d="M-30-38v8m-4-4h8M30-60v8m-4-4h8M10-85v6m-3-3h6"/></g>}
 </g>;
}
