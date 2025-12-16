const Product = require('../models/Product');
const axios = require('axios');

function parsePrompt(prompt) {
  const text = (prompt || '').toLowerCase();
  const occasions = ['wedding', 'office', 'interview', 'party', 'date', 'eid', 'puja', 'festival', 'birthday', 'teacher', 'father'];
  const styles = ['formal', 'semi-formal', 'casual', 'traditional'];
  const colors = ['black', 'white', 'navy', 'blue', 'gray', 'brown', 'red', 'maroon', 'beige', 'cream', 'mustard'];

  let occasion = occasions.find(o => text.includes(o)) || 'general';
  let style = styles.find(s => text.includes(s)) || 'casual';
  const mentionedColors = colors.filter(c => text.includes(c));

  let type = 'Casual';
  if (style === 'formal') type = 'Formal';
  else if (style === 'semi-formal') type = 'Semi-formal';
  else if (style === 'traditional') type = 'Traditional';

  let categories = ['shirts', 'pants', 'blazers'];
  if (style === 'casual') categories = ['shirts', 'pants'];
  if (style === 'traditional') categories = ['panjabi'];
  if (['eid', 'puja', 'festival'].includes(occasion) && !categories.includes('panjabi')) {
    categories = Array.from(new Set([...categories, 'panjabi']));
  }

  const weddingTokens = ['engagement', 'reception', 'walima'];
  const officeTokens = ['corporate', 'farewell', 'award', 'meeting', 'seminar', 'conference'];
  const casualTokens = ['friends', 'get-together', 'get together', 'outing', 'university', 'concert'];
  const traditionalTokens = ['gaye holud', 'nikah', 'pohela boishakh', 'milad', 'akikah'];
  const teacherTokens = ['teacher', 'teachers'];
  const fatherTokens = ['father', 'fathers'];

  if (weddingTokens.some(t => text.includes(t))) {
    occasion = 'wedding';
    if (style !== 'traditional') {
      style = 'formal';
      type = 'Formal';
      categories = ['shirts', 'pants', 'blazers'];
    }
  }
  if (officeTokens.some(t => text.includes(t))) {
    occasion = 'office';
    style = style === 'traditional' ? 'traditional' : 'formal';
    type = style === 'traditional' ? 'Traditional' : 'Formal';
    categories = style === 'traditional' ? ['panjabi'] : ['shirts', 'pants', 'blazers'];
  }
  if (casualTokens.some(t => text.includes(t))) {
    occasion = 'birthday';
    style = 'casual';
    type = 'Casual';
    categories = ['shirts', 'pants'];
  }
  if (traditionalTokens.some(t => text.includes(t))) {
    occasion = 'festival';
    style = 'traditional';
    type = 'Traditional';
    categories = ['panjabi'];
  }
  if (teacherTokens.some(t => text.includes(t))) {
    occasion = 'teacher';
    style = 'semi-formal';
    type = 'Semi-formal';
    categories = ['shirts', 'pants', 'blazers'];
  }
  if (fatherTokens.some(t => text.includes(t))) {
    occasion = 'father';
    style = 'semi-formal';
    type = 'Semi-formal';
    categories = ['shirts', 'pants', 'blazers'];
  }

  return { occasion, style, type, colors: mentionedColors, categories };
}

function generateMessage(parsed) {
  const O = parsed.occasion;
  const S = parsed.style;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  if (O === 'wedding') {
    if (S === 'formal') {
      return pick([
        'For a wedding, elevate with a crisp shirt, tailored pants, and a sharp blazer.',
        'Wedding-ready: a polished blazer over a clean shirt with tailored trousers.',
        'Formal wedding look: structured blazer, neat shirt, and tailored pants.'
      ]);
    }
    if (S === 'traditional') {
      return pick([
        'For a wedding, choose a refined panjabi in rich tones for classic elegance.',
        'Traditional wedding style: a premium panjabi with tasteful detailing.',
        'A sophisticated panjabi in deep hues suits wedding celebrations beautifully.'
      ]);
    }
    return pick([
      'For a wedding, balance a blazer, shirt, and pants for versatile sophistication.',
      'Wedding style: pair a textured blazer with a smart shirt and tailored trousers.',
      'Go for a blazer, crisp shirt, and tapered pants for a refined wedding fit.'
    ]);
  }
  if (O === 'birthday') {
    if (S === 'casual') {
      return pick([
        'For a birthday, keep it relaxed with a casual shirt and easy chinos.',
        'Birthday casual: a breathable shirt with comfortable pants hits the sweet spot.',
        'Go laid-back with a soft shirt and chinos for birthday plans.'
      ]);
    }
    return pick([
      'For a birthday, smart-casual staples like a textured blazer, shirt, and pants work well.',
      'Birthday look: lightweight blazer, clean shirt, and tapered trousers.',
      'Try a neat blazer over a comfortable shirt with chinos for birthday outings.'
    ]);
  }
  if (O === 'eid' || O === 'puja' || O === 'festival') {
    return pick([
      'For festivals, traditional panjabi styles in elegant colors are a great pick.',
      'Festival fit: a classic panjabi in rich tones with clean tailoring.',
      'Celebrate in a refined panjabi with subtle texture and dignified color.'
    ]);
  }
  if (O === 'interview' || O === 'office') {
    return pick([
      'For professional settings, a formal shirt, tailored pants, and a blazer project confidence.',
      'Office-ready: structured blazer, crisp shirt, and sharp trousers.',
      'Interview polish: neat blazer, tidy shirt, and tapered pants.'
    ]);
  }
  if (O === 'teacher') {
    return pick([
      'For Teacher’s Day, aim for a neat shirt, tailored pants, and a light blazer for respectful polish.',
      'Teacher’s Day look: clean shirt, tapered trousers, and an easy blazer.',
      'Mark Teacher’s Day with a tidy shirt, sharp pants, and a refined blazer.'
    ]);
  }
  if (O === 'father') {
    return pick([
      'For Father’s Day, go smart-casual with a soft shirt and chinos; add a blazer if the event is formal.',
      'Father’s Day fit: breathable shirt, comfortable chinos, and a relaxed blazer if needed.',
      'Keep Father’s Day balanced with a clean shirt and tapered pants; layer a blazer for polish.'
    ]);
  }
  if (S === 'formal') {
    return pick([
      'Go formal with a clean shirt, tailored pants, and a sharp blazer.',
      'A crisp shirt with structured trousers and blazer delivers formal finesse.',
      'Formal essentials: refined blazer, neat shirt, and tailored pants.'
    ]);
  }
  if (S === 'semi-formal') {
    return pick([
      'Semi-formal staples like a textured blazer, shirt, and chinos balance elegance and ease.',
      'Semi-formal look: relaxed blazer, tidy shirt, and tapered chinos.',
      'Aim for a light blazer, clean shirt, and comfortable chinos.'
    ]);
  }
  if (S === 'traditional') {
    return pick([
      'Traditional panjabi styles deliver timeless elegance.',
      'Choose a classic panjabi in understated tones for a graceful traditional look.',
      'A well-cut panjabi offers refined, traditional charm.'
    ]);
  }
  return pick([
    'Casual essentials like comfortable shirts and pants keep things effortless.',
    'Go easy with a breathable shirt and relaxed-fit pants for casual plans.',
    'Casual vibe: soft shirt with chinos for everyday comfort.'
  ]);
}

function balancePicks(candidates, desiredCategories, limit = 8, desiredType = null) {
  const byCat = new Map();
  candidates.forEach(p => {
    const cat = p.category;
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat).push(p);
  });
  const picked = [];
  const seen = new Set();
  // Ensure one from each desired category if available
  for (const cat of desiredCategories) {
    const list = byCat.get(cat) || [];
    const primary = desiredType ? list.filter(p => p.type === desiredType && !(desiredType === 'Formal' && /jean/i.test(p.name || ''))) : list;
    const toScan = primary.length > 0 ? primary : list;
    for (const p of toScan) {
      const id = String(p._id);
      if (!seen.has(id)) {
        picked.push(p);
        seen.add(id);
        break;
      }
    }
  }
  // Fill remaining slots from all categories by featured/newest
  if (picked.length < limit) {
    for (const p of candidates) {
      if (!desiredCategories.includes(p.category)) continue;
      if (desiredType && p.type !== desiredType) continue;
      if (desiredType === 'Formal' && /jean/i.test(p.name || '')) continue;
      const id = String(p._id);
      if (!seen.has(id)) {
        picked.push(p);
        seen.add(id);
        if (picked.length >= limit) break;
      }
    }
  }
  if (picked.length < limit) {
    for (const p of candidates) {
      if (!desiredCategories.includes(p.category)) continue;
      if (desiredType === 'Formal' && /jean/i.test(p.name || '')) continue;
      const id = String(p._id);
      if (!seen.has(id)) {
        picked.push(p);
        seen.add(id);
        if (picked.length >= limit) break;
      }
    }
  }
  return picked.slice(0, limit);
}

exports.suggestOutfit = async (req, res) => {
  try {
    const { prompt } = req.body;
    const parsed = parsePrompt(prompt);

    const filter = { type: parsed.type, category: { $in: parsed.categories } };
    if (parsed.colors.length > 0) {
      filter.color = { $in: parsed.colors.map(c => new RegExp(c, 'i')) };
    }

    let candidates = await Product.find(filter).sort({ featured: -1, createdAt: -1 }).limit(80);
    if (!candidates || candidates.length === 0) {
      candidates = await Product.find({ category: { $in: parsed.categories } }).sort({ featured: -1, createdAt: -1 }).limit(80);
    }
    if (!candidates || candidates.length === 0) {
      candidates = await Product.find({}).sort({ featured: -1, createdAt: -1 }).limit(80);
    }
    if (parsed.categories.includes('panjabi')) {
      const hasPanjabi = candidates.some(p => p.category === 'panjabi');
      if (!hasPanjabi) {
        const extraPanjabi = await Product.find({ category: 'panjabi' }).sort({ featured: -1, createdAt: -1 }).limit(20);
        const seenIds = new Set(candidates.map(p => String(p._id)));
        extraPanjabi.forEach(p => {
          const id = String(p._id);
          if (!seenIds.has(id)) candidates.push(p);
        });
      }
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      try {
        const catalog = candidates.map(p => ({
          id: String(p._id),
          name: p.name,
          category: p.category,
          type: p.type,
          color: p.color,
          price: p.price,
          sizes: p.sizes,
          featured: !!p.featured,
        }));
        const sys = 'You are a fashion assistant. Given a user prompt and a product catalog, propose a brief outfit recommendation and select 4-8 product IDs that fit balanced across categories in the catalog (shirts, pants, blazers, panjabi when relevant). Return strictly JSON: {"message": "...", "productIds": ["...", "..."]}. Keep message under 2 sentences.';
        const userMsg = JSON.stringify({
          prompt,
          occasion: parsed.occasion,
          style: parsed.style,
          colors: parsed.colors,
          desiredCategories: parsed.categories,
          catalog,
        });
        const resp = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: sys },
              { role: 'user', content: userMsg }
            ],
            temperature: 0.7,
          },
          { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
        );
        const content = resp.data?.choices?.[0]?.message?.content || '';
        let parsedOut = null;
        try {
          parsedOut = JSON.parse(content);
        } catch {
          parsedOut = null;
        }
        const productIds = Array.isArray(parsedOut?.productIds) ? parsedOut.productIds : [];
        const pickMap = new Map(candidates.map(p => [String(p._id), p]));
        let picks = productIds.map(id => pickMap.get(String(id))).filter(Boolean);
        const preFiltered = candidates.filter(p => parsed.categories.includes(p.category) && p.type === parsed.type && !(parsed.type === 'Formal' && /jean/i.test(p.name || '')));
        const balanced = balancePicks(preFiltered.length ? preFiltered : candidates, parsed.categories, 8, parsed.type);
        const merged = [];
        const seen = new Set();
        [...picks, ...balanced].forEach(p => {
          if (!p) return;
          const id = String(p._id);
          if (!seen.has(id)) {
            merged.push(p);
            seen.add(id);
          }
        });
        const finalSuggestions = merged.filter(p => parsed.categories.includes(p.category) && p.type === parsed.type && !(parsed.type === 'Formal' && /jean/i.test(p.name || '')));
        const message = parsedOut?.message || generateMessage(parsed);
        return res.json({
          message,
          suggestions: (finalSuggestions.length ? finalSuggestions : merged).slice(0, 12),
          appliedFilters: { occasion: parsed.occasion, style: parsed.style, colors: parsed.colors, categories: parsed.categories, generative: true }
        });
      } catch (aiErr) {
        // Fall through to heuristic mode below
      }
    }

    const baseMessage = generateMessage(parsed);
    const colorHint =
      parsed.colors.length > 0
        ? ` Colors: ${parsed.colors.map(c => c[0].toUpperCase() + c.slice(1)).join(', ')}.`
        : '';
    const message = `${baseMessage}${colorHint ? ' ' + colorHint : ''}`;

    const preFiltered = candidates.filter(p => parsed.categories.includes(p.category) && p.type === parsed.type && !(parsed.type === 'Formal' && /jean/i.test(p.name || '')));
    const picks = balancePicks(preFiltered.length ? preFiltered : candidates, parsed.categories, 12, parsed.type);
    res.json({
      message,
      suggestions: picks,
      appliedFilters: {
        occasion: parsed.occasion,
        style: parsed.style,
        colors: parsed.colors,
        categories: parsed.categories
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate outfit suggestions' });
  }
};
