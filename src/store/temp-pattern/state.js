export default function () {
  return {
    _id: '',
    name: '',
    composer: '',
    keysounded: '',
    difficulties: [],
    link: '',
    previews: [],
    image: '',
    description: '',
    submitter: { name: '', _id: '' },
    comments: [],
    myComment: { rating: 0, comment: '', replies: [], _id: '' },
    rating: {
      rating: 0,
      count: 0
    },
    commentsScrollDisabled: false
  }
}
