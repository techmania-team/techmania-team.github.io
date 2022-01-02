export default function () {
  return {
    _id: '',
    name: '',
    type: 0,
    link: '',
    previews: [{ link: '', name: '' }],
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
