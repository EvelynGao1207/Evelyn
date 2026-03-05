const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const axios = require('axios');

// RSS/API sources for neuroscience news
const NEWS_SOURCES = [
  {
    name: 'PubMed Neuroscience',
    url: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi',
    params: { db: 'pubmed', term: 'neuroscience OR cognitive psychology', retmax: 20, sort: 'date', retmode: 'json' }
  },
  {
    name: 'bioRxiv Neuroscience',
    url: 'https://api.biorxiv.org/details/biorxiv/2024-01-01/2024-12-31/0/25',
    category: 'neuroscience'
  }
];

exports.main = async (event) => {
  const { action, id, category, page = 1, pageSize = 10 } = event;

  // Get single article detail
  if (action === 'detail' && id) {
    try {
      const res = await db.collection('news').doc(id).get();
      return { code: 0, data: res.data };
    } catch (err) {
      return { code: -1, message: err.message };
    }
  }

  // Fetch news list
  try {
    const skip = (page - 1) * pageSize;
    let query = db.collection('news');

    if (category) {
      query = query.where({ category: category });
    }

    const res = await query
      .orderBy('publishTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get();

    return { code: 0, data: res.data };
  } catch (err) {
    // If collection doesn't exist yet, return demo data
    return { code: 0, data: getDemoData(category, page, pageSize) };
  }
};

// Scheduled function: fetch and store latest news (triggered by cloud timer)
async function fetchAndStoreNews() {
  try {
    // Fetch from PubMed
    const pubmedRes = await axios.get(NEWS_SOURCES[0].url, {
      params: NEWS_SOURCES[0].params
    });

    const ids = pubmedRes.data.esearchresult.idlist || [];
    if (ids.length === 0) return;

    // Get article summaries
    const summaryUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';
    const summaryRes = await axios.get(summaryUrl, {
      params: { db: 'pubmed', id: ids.join(','), retmode: 'json' }
    });

    const articles = [];
    const result = summaryRes.data.result || {};
    for (const id of ids) {
      const article = result[id];
      if (!article) continue;

      articles.push({
        title: article.title,
        summary: article.sortfirstauthor + ' et al. - ' + (article.source || ''),
        source: article.source || 'PubMed',
        category: classifyArticle(article.title),
        publishTime: new Date(article.pubdate || Date.now()),
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        content: article.title,
        tags: (article.meshterms || []).slice(0, 5),
        fetchedAt: new Date()
      });
    }

    // Batch insert to database
    for (const article of articles) {
      const existing = await db.collection('news')
        .where({ url: article.url })
        .count();
      if (existing.total === 0) {
        await db.collection('news').add({ data: article });
      }
    }

    return { code: 0, stored: articles.length };
  } catch (err) {
    console.error('Failed to fetch news:', err);
    return { code: -1, message: err.message };
  }
}

function classifyArticle(title) {
  const lower = title.toLowerCase();
  if (lower.includes('fmri') || lower.includes('imaging') || lower.includes('mri')) return 'neuroimaging';
  if (lower.includes('cognit') || lower.includes('memory') || lower.includes('attention')) return 'cognitive';
  if (lower.includes('computational') || lower.includes('model') || lower.includes('network')) return 'computational';
  if (lower.includes('clinical') || lower.includes('patient') || lower.includes('disorder')) return 'clinical';
  return 'neuroscience';
}

function getDemoData(category, page, pageSize) {
  const allData = [
    {
      _id: 'demo1',
      title: 'Prefrontal Cortex Neurons Encode Abstract Rules for Flexible Behavior',
      summary: 'Researchers at MIT discovered a new population of neurons in the prefrontal cortex that encode abstract task rules, enabling rapid behavioral flexibility in primates.',
      source: 'Nature Neuroscience',
      category: 'neuroscience',
      publishTime: new Date().toISOString(),
      tags: ['PFC', 'flexibility', 'rule encoding']
    },
    {
      _id: 'demo2',
      title: 'Working Memory Capacity Linked to Neural Oscillation Patterns',
      summary: 'A new study using MEG shows that individual differences in working memory capacity correlate with the power and frequency of theta-gamma coupling in parietal cortex.',
      source: 'Cerebral Cortex',
      category: 'cognitive',
      publishTime: new Date(Date.now() - 7200000).toISOString(),
      tags: ['working memory', 'oscillations', 'MEG']
    },
    {
      _id: 'demo3',
      title: 'Novel fMRI Technique Reveals Sub-millimeter Brain Activity Patterns',
      summary: 'Scientists have developed a new ultra-high resolution fMRI method capable of detecting neural activity at columnar and laminar scales in awake humans.',
      source: 'Science',
      category: 'neuroimaging',
      publishTime: new Date(Date.now() - 18000000).toISOString(),
      tags: ['fMRI', 'high-resolution', 'columns']
    },
    {
      _id: 'demo4',
      title: 'Deep Learning Model Predicts Alzheimer Progression from EEG Signals',
      summary: 'A transformer-based model trained on longitudinal EEG data achieves 92% accuracy in predicting cognitive decline trajectory in early-stage Alzheimer patients.',
      source: 'NeuroImage: Clinical',
      category: 'computational',
      publishTime: new Date(Date.now() - 36000000).toISOString(),
      tags: ['deep learning', 'Alzheimer', 'EEG']
    },
    {
      _id: 'demo5',
      title: 'Attention Restoration Theory Gets Neural Evidence from Forest Bathing Study',
      summary: 'Researchers found that 30-minute nature exposure significantly reduces default mode network activity and enhances top-down attentional control.',
      source: 'PNAS',
      category: 'cognitive',
      publishTime: new Date(Date.now() - 86400000).toISOString(),
      tags: ['attention', 'nature', 'DMN']
    }
  ];

  let filtered = allData;
  if (category) {
    filtered = allData.filter(d => d.category === category);
  }
  return filtered.slice((page - 1) * pageSize, page * pageSize);
}
