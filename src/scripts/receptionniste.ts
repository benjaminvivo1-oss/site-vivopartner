/**
 * Page Réceptionniste IA : carrousel « Ce qu'elle fait pour vous », démo et simulateur.
 * Logique et textes repris de la maquette (PageReceptionniste), plus le récapitulatif « Voir l'appel ».
 */
import { bindAll, onAll, type Vals } from './bind';

const scope = document.querySelector('main');
if (scope) {
  const ACCENT = '#F58220';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const st = {
    simA: 25,
    simM: 30,
    simC: 20,
    simV: 3500,
    simR: 60,
    i: 0,
    k: 0,
    paused: false,
    status: 'idle' as 'idle' | 'live' | 'done',
    msgs: [] as { bot: boolean; text: string }[],
    step: 0,
    data: { need: '', nom: '', ville: '', tel: '' },
    draft: '',
    typing: false,
    secs: 0,
    urgent: false,
  };
  let carTimer = 0;
  let tickTimer = 0;
  let botTimer = 0;
  const fmt = (x: number) => Math.round(x).toLocaleString('fr-FR').replace(/ | /g, ' ');

  /* ---------- Carrousel ---------- */
  function carVals(out: Vals) {
    const n = 6,
      xs = [0, 340, 560, 720],
      sc = [1.06, 0.82, 0.7, 0.62],
      op = [1, 0.55, 0.28, 0];
    for (let j = 0; j < n; j++) {
      const d = (j - st.i + n) % n;
      const off = d > n / 2 ? d - n : d;
      const a = Math.abs(off);
      const x = (off < 0 ? -1 : 1) * xs[a];
      const hidden = a >= 3;
      out['c' + j] =
        'transform: translate(calc(-50% + ' +
        x +
        'px), -50%) scale(' +
        sc[a] +
        ') rotateY(' +
        (off === 0 ? 0 : off < 0 ? 14 : -14) +
        'deg); opacity: ' +
        op[a] +
        '; z-index: ' +
        (10 - a) +
        '; cursor: ' +
        (a === 0 ? 'default' : 'pointer') +
        '; pointer-events: ' +
        (hidden ? 'none' : 'auto') +
        (a === 0
          ? '; border: 2px solid ' +
            ACCENT +
            '; box-shadow: 0 34px 80px rgba(6,37,90,0.24), 0 0 0 8px rgba(245,130,32,0.14)'
          : '; filter: saturate(.8)');
      const act = j === st.i;
      out['d' + j] = 'width: ' + (act ? 44 : 10) + 'px';
      out['cur' + j] = act ? 'true' : 'false';
      out['p' + j] = act
        ? 'position: absolute; left: 0; top: 0; bottom: 0; background: ' +
          ACCENT +
          '; width: 100%; animation: ' +
          (st.k % 2 ? 'pa' : 'pb') +
          ' 10s linear forwards; animation-play-state: ' +
          (st.paused ? 'paused' : 'running')
        : 'display: none';
    }
    out.toggleLabel = st.paused ? 'Reprendre le défilement automatique' : 'Mettre en pause le défilement automatique';
    out.toggleIcon = st.paused ? '▶' : 'II';
  }
  function startCar() {
    clearInterval(carTimer);
    if (reduceMotion) {
      st.paused = true;
      return;
    }
    carTimer = window.setInterval(() => {
      if (!st.paused) {
        st.i = (st.i + 1) % 6;
        st.k++;
        render();
      }
    }, 10000);
  }
  const go = (n: number) => {
    st.i = (n + 6) % 6;
    st.k++;
    startCar();
    render();
  };

  /* ---------- Simulateur ---------- */
  function simVals(out: Vals) {
    const rnd = (x: number) => {
      const s = x >= 20000 ? 1000 : x >= 2000 ? 100 : x >= 200 ? 10 : 1;
      return Math.round(x / s) * s;
    };
    out.sv_a = String(st.simA);
    out.sv_m = String(st.simM);
    out.sv_c = String(st.simC);
    out.sv_v = String(st.simV);
    out.sv_r = String(st.simR);
    out.sl_a = st.simA + ' appels';
    out.sl_m = st.simM + ' %';
    out.sl_c = st.simC + ' %';
    out.sl_v = fmt(st.simV) + ' €';
    out.sl_r = st.simR + ' %';
    const miss = st.simA * (st.simM / 100) * 4.3;
    const jobs = miss * (st.simC / 100);
    const lost = jobs * st.simV * 12;
    out.r_miss = fmt(miss);
    out.r_jobs = fmt(jobs);
    out.r_lost = fmt(rnd(lost)) + ' €';
    out.r_save = fmt(rnd(lost * (st.simR / 100))) + ' €';
  }

  /* ---------- Démo d'appel (simulation de la maquette) ---------- */
  const say = (text: string) => {
    st.msgs = st.msgs.concat([{ bot: true, text }]);
    st.typing = false;
    render();
  };
  const botSay = (text: string, delay = 800) => {
    st.typing = true;
    clearTimeout(botTimer);
    botTimer = window.setTimeout(() => say(text), delay);
    render();
  };
  function start() {
    clearInterval(tickTimer);
    Object.assign(st, {
      status: 'live',
      msgs: [],
      step: 0,
      data: { need: '', nom: '', ville: '', tel: '' },
      draft: '',
      secs: 0,
      urgent: false,
      typing: true,
    });
    tickTimer = window.setInterval(() => {
      if (st.status === 'live') {
        st.secs++;
        render();
      }
    }, 1000);
    clearTimeout(botTimer);
    botTimer = window.setTimeout(
      () =>
        say(
          "Bonjour, vous êtes bien chez l'entreprise (exemple). Je suis l'assistante, je prends votre demande. Que puis-je faire pour vous ?",
        ),
      700,
    );
    render();
    input?.focus();
  }
  function reset() {
    clearTimeout(botTimer);
    clearInterval(tickTimer);
    Object.assign(st, {
      status: 'idle',
      msgs: [],
      step: 0,
      data: { need: '', nom: '', ville: '', tel: '' },
      draft: '',
      typing: false,
      secs: 0,
      urgent: false,
    });
    render();
  }
  function reply(txt: string) {
    const t = (txt || '').trim();
    if (!t || st.typing || st.status !== 'live') return;
    if (input) input.value = '';
    const d = { ...st.data };
    const s0 = st.step;
    st.msgs = st.msgs.concat([{ bot: false, text: t }]);
    if (s0 === 0) {
      d.need = t;
      st.urgent =
        /fuite|inond|panne|urgen|plus d.électricité|court-circuit|odeur de gaz|dégât|ça coule|coule beaucoup/i.test(t);
    }
    if (s0 === 1) d.nom = t;
    if (s0 === 2) d.ville = t;
    if (s0 === 3) d.tel = t;
    Object.assign(st, { data: d, draft: '', step: s0 + 1 });
    if (s0 === 0)
      botSay(
        (st.urgent
          ? "Je suis désolée d'entendre ça, je prends vos informations tout de suite. "
          : 'Très bien, je note votre demande. ') + 'Quel est votre nom ?',
      );
    else if (s0 === 1) botSay('Merci ' + t + '. Dans quelle commune se trouve le chantier ?');
    else if (s0 === 2) botSay('Parfait. Et un numéro de téléphone pour que le responsable vous rappelle ?');
    else if (s0 === 3) {
      st.typing = true;
      clearTimeout(botTimer);
      botTimer = window.setTimeout(() => {
        st.msgs = st.msgs.concat([
          {
            bot: true,
            text:
              'Merci ' +
              (d.nom || '') +
              ", j'ai tout noté. Le responsable vous rappelle " +
              (st.urgent ? 'au plus vite' : 'sous 24 h') +
              '. Bonne journée !',
          },
        ]);
        clearInterval(tickTimer);
        st.typing = false;
        st.status = 'done';
        render();
      }, 900);
      render();
    }
  }
  function chatVals(out: Vals) {
    const rm = (v: string, f: string) => (v && v.trim() ? v.trim() : f);
    out.isIdle = st.status === 'idle';
    out.inCall = st.status !== 'idle';
    out.isLive = st.status === 'live';
    out.isDone = st.status === 'done';
    out.canReset = st.status !== 'idle';
    out.canType = st.status === 'live' && !st.typing && st.msgs.length > 0;
    out.showChips = st.step === 0;
    const mm = Math.floor(st.secs / 60),
      ss = st.secs % 60;
    const dur = mm + ':' + (ss < 10 ? '0' : '') + ss;
    out.callState =
      st.status === 'live'
        ? st.typing
          ? 'écrit…'
          : 'En ligne · ' + dur
        : st.status === 'done'
          ? 'Appel terminé · ' + dur
          : 'Disponible';
    out.draft = st.draft;
    out.placeholder = ['Décrivez votre besoin…', 'Votre nom', 'Votre commune', 'Votre numéro de téléphone', ''][
      Math.min(st.step, 4)
    ];
    const dd = st.data;
    const need = rm(dd.need, '…');
    out.urgent = st.urgent;
    out.rHead = st.status === 'done' ? "Résumé de l'appel" : 'Appel en cours';
    out.rSub = st.status === 'done' ? "reçu à l'instant · " + dur : 'Une réceptionniste a décroché · ' + dur;
    out.rTitle = dd.need ? (st.urgent ? 'Demande urgente' : 'Nouvelle demande') : 'Nouvel appel…';
    out.rNom = rm(dd.nom, '…');
    out.rTel = rm(dd.tel, '…');
    out.rVille = rm(dd.ville, '…');
    out.rBesoin = need.length > 90 ? need.slice(0, 87) + '…' : need;
    out.rAction = st.urgent ? 'À rappeler en priorité' : 'À rappeler dans la journée';
  }

  // Messages : du plus récent au plus ancien, la zone est en column-reverse (comme la maquette).
  const list = scope.querySelector<HTMLElement>('[data-msgs]');
  const tpl = scope.querySelector<HTMLTemplateElement>('template[data-msg-row]');
  const bubbleStyle = (bot: boolean) =>
    'box-sizing: border-box; max-width: 86%; padding: 11px 15px; display: flex; flex-direction: column; gap: 3px; ' +
    (bot
      ? 'background: #ffffff; border: 1px solid #DCE3F0; color: #06255A; border-radius: 18px 18px 18px 6px'
      : 'background: #06255A; color: #ffffff; border-radius: 18px 18px 6px 18px');
  /** Une bulle de la conversation (ou « … » quand elle écrit). */
  function messageRow(m: { bot: boolean; text: string } | null, recap = false) {
    const row = (tpl!.content.firstElementChild as HTMLElement).cloneNode(true) as HTMLElement;
    const bubble = row.firstElementChild as HTMLElement;
    const bot = m ? m.bot : true;
    row.setAttribute('style', 'display: flex; justify-content: ' + (bot ? 'flex-start' : 'flex-end'));
    bubble.setAttribute('style', bubbleStyle(bot) + (m ? '' : '; color: #5B6B8F'));
    (bubble.querySelector('[data-who]') as HTMLElement).textContent = bot
      ? 'Réceptionniste'
      : recap
        ? 'Le client'
        : 'Vous (le client)';
    (bubble.querySelector('[data-text]') as HTMLElement).textContent = m ? m.text : '…';
    return row;
  }
  let shown = '';
  function renderMsgs() {
    if (!list || !tpl) return;
    const key = JSON.stringify([st.msgs, st.typing]);
    if (key === shown) return;
    shown = key;
    list.querySelectorAll(':scope > div').forEach((n) => n.remove());
    const rows = st.msgs.map((m) => messageRow(m));
    if (st.typing) rows.push(messageRow(null));
    rows.reverse().forEach((r) => list.append(r));
  }

  function render() {
    const out: Vals = {};
    carVals(out);
    simVals(out);
    chatVals(out);
    bindAll(scope as ParentNode, out);
    renderMsgs();
  }

  /* ---------- « Voir l'appel » : récapitulatif complet ---------- */
  const dialog = scope.querySelector<HTMLDialogElement>('[data-call-dialog]');
  function openRecap() {
    if (!dialog || !tpl) return;
    const d = st.data;
    const mm = Math.floor(st.secs / 60),
      ss = st.secs % 60;
    const set = (sel: string, txt: string) => {
      const el = dialog.querySelector<HTMLElement>(sel);
      if (el) el.textContent = txt;
    };
    set(
      '[data-recap-meta]',
      "Reçu à l'instant · durée " + mm + ':' + (ss < 10 ? '0' : '') + ss + ' · ' + st.msgs.length + ' messages',
    );
    set('[data-recap-title]', st.urgent ? 'Demande urgente' : 'Nouvelle demande');
    set('[data-recap="nom"]', d.nom || '…');
    set('[data-recap="tel"]', d.tel || '…');
    set('[data-recap="ville"]', d.ville || '…');
    set('[data-recap="need"]', d.need || '…');
    set('[data-recap="action"]', st.urgent ? 'À rappeler en priorité' : 'À rappeler dans la journée');
    const urgent = dialog.querySelector<HTMLElement>('[data-recap-urgent]');
    if (urgent) urgent.hidden = !st.urgent;
    dialog.querySelector<HTMLElement>('[data-recap-list]')?.replaceChildren(...st.msgs.map((m) => messageRow(m, true)));
    dialog.showModal();
  }
  scope.querySelector('[data-show-call]')?.addEventListener('click', openRecap);
  dialog?.querySelectorAll('[data-recap-close]').forEach((b) => b.addEventListener('click', () => dialog.close()));
  dialog?.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close(); // clic sur le fond
  });

  /* ---------- Branchements ---------- */
  const input = scope.querySelector<HTMLInputElement>('input.ci');
  const chips = [
    "Bonjour, j'ai une fuite sous mon évier, ça coule beaucoup.",
    'Bonjour, je voudrais un devis pour refaire ma salle de bain.',
    "Je n'ai plus d'électricité dans toute la maison depuis ce matin.",
  ];
  const clicks: Record<string, () => void> = {
    prev: () => go(st.i - 1),
    next: () => go(st.i + 1),
    toggle: () => {
      st.paused = !st.paused;
      st.k++;
      if (!st.paused) startCar();
      render();
    },
    start,
    reset,
    send: () => reply(st.draft),
    chip0: () => reply(chips[0]),
    chip1: () => reply(chips[1]),
    chip2: () => reply(chips[2]),
  };
  for (let j = 0; j < 6; j++) clicks['go' + j] = () => go(j);
  onAll(scope, 'click', Object.fromEntries(Object.entries(clicks).map(([k, f]) => [k, () => f()])));
  onAll(scope, 'change', {
    son_a: (_e, el) => ((st.simA = Number((el as HTMLInputElement).value)), render()),
    son_m: (_e, el) => ((st.simM = Number((el as HTMLInputElement).value)), render()),
    son_c: (_e, el) => ((st.simC = Number((el as HTMLInputElement).value)), render()),
    son_v: (_e, el) => ((st.simV = Number((el as HTMLInputElement).value)), render()),
    son_r: (_e, el) => ((st.simR = Number((el as HTMLInputElement).value)), render()),
    onDraft: (_e, el) => {
      st.draft = (el as HTMLInputElement).value;
    },
  });
  onAll(scope, 'keydown', {
    onKey: (e, el) => {
      const k = (e as KeyboardEvent).key;
      if (el.matches('input')) {
        if (k === 'Enter') {
          e.preventDefault();
          reply((el as HTMLInputElement).value);
        }
      } else if (k === 'ArrowRight') go(st.i + 1);
      else if (k === 'ArrowLeft') go(st.i - 1);
    },
  });

  startCar();
  render();
}
