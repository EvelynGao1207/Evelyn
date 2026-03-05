/**
 * API utility for cloud function calls
 */
const callCloud = (name, data = {}) => {
  return wx.cloud.callFunction({
    name,
    data
  }).then(res => res.result);
};

// Fetch news list with optional category filter and pagination
const getNewsList = (category = '', page = 1, pageSize = 10) => {
  return callCloud('getNews', { category, page, pageSize });
};

// Fetch single news detail
const getNewsDetail = (id) => {
  return callCloud('getNews', { id, action: 'detail' });
};

// Translate text to Chinese
const translateText = (text, from = 'en', to = 'zh') => {
  return callCloud('translate', { text, from, to });
};

// Get knowledge categories and articles
const getKnowledgeList = (category = '', page = 1) => {
  return callCloud('getKnowledge', { category, page });
};

const getKnowledgeDetail = (id) => {
  return callCloud('getKnowledge', { id, action: 'detail' });
};

module.exports = {
  getNewsList,
  getNewsDetail,
  translateText,
  getKnowledgeList,
  getKnowledgeDetail
};
