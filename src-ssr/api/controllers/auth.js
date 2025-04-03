export const getInfo = async (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      result: {
        _id: req.user._id,
        name: req.user.name,
        avatar: `https://cdn.discordapp.com/avatars/${req.user.discord}/${req.user.avatar}.png`,
      },
    })
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' })
  }
}
