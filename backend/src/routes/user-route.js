require("dotenv").config();
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const { User, Channel, Invite, Chat, SubChannel, ChannelMember, SubChannelMember, Sequelize } = require("../../models");
const { Op } = Sequelize;
const {
   signupSchema,
   loginSchema,
   changePasswordSchema,
   updateProfileSchema,
   channelSchema,
   subChannelSchema,
} = require("../validation/validation");
const auth = require("../middleware/MiddleWareCon");
const multer = require("multer");
const path = require("path");
// Signup
const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, "public/profiles/");
   },
   filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
   },
});
const upload = multer({ storage: storage });

router.post("/signup", async (req, res) => {
   const { error } = signupSchema.validate(req.body);
   if (error) return res.status(400).json({ error: error.details[0].message });

   const { name, email, password, department, faculty, year } = req.body;

   try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
         return res.status(400).json({ error: "Email already in use" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashedPassword, department, faculty, year });

      res.status(201).json({ message: "User created successfully" });
   } catch (err) {
      res.status(400).json({ error: err.message });
   }
});

// Login
router.post("/login", async (req, res) => {
   const { error } = loginSchema.validate(req.body);
   if (error) return res.status(400).json({ error: error.details[0].message });

   const { email, password } = req.body;

   try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
         return res.status(401).json({ error: "Invalid email or password" });
      }

      let obj = {
         _id: user.id,
         name: user.name,
         email: user.email,
         faculty: user.faculty,
         year: user.year,
         image: user.image,
         biography: user.biography,
         department: user.department,
      };

      // Parolayı veritabanındaki hashlı parolayla karşılaştırma
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
         return res.status(401).json({ error: "Wrong Passwotd" });
      }
      const token = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET);
      res.json({ token, user: obj });
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

router.patch("/password", auth, async (req, res) => {
   const { error } = changePasswordSchema.validate(req.body);
   if (error) return res.status(400).json({ error: error.details[0].message });

   const { newPassword } = req.body;

   try {
      const user = await User.findByPk(req.user.id);
      if (!user) {
         return res.status(404).json({ error: "User not found" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.json({ message: "Password changed successfully" });
   } catch (err) {
      res.status(400).json({ error: err.message });
   }
});

// Get profile
router.get("/profile", auth, async (req, res) => {
   try {
      const user = await User.findByPk(req.user.id, {
         attributes: { exclude: ["password"] }, // Şifre kısmını çıkarma
      });

      if (!user) {
         return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
   } catch (err) {
      res.status(400).json({ error: err.message });
   }
});

router.patch("/profile/image", auth, upload.single("image"), async (req, res) => {
   if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
   }

   const serverPath = process.env.IMAGE_PATH_ORIGIN;

   const imageUrl = serverPath + "public/profiles/" + req.file.filename;

   try {
      const user = await User.findByPk(req.user.id);
      user.image = imageUrl;
      await user.save();
      res.json(user);
   } catch (err) {
      // Hata varsa resim kısmını çıkarma
      fs.unlinkSync(req.file.path);
      res.status(400).json({ error: err.message });
   }
});

router.delete("/profile/image", auth, async (req, res) => {
   try {
      const user = await User.findByPk(req.user.id);

      if (!user) {
         return res.status(404).json({ error: "User not found" });
      }

      // Kullanıcının resim URL'ini sıfırlama
      user.image = null;
      await user.save();

      res.json(user);
   } catch (err) {
      res.status(400).json({ error: err.message });
   }
});

router.patch("/channel/:channelId/image", auth, upload.single("image"), async (req, res) => {
   const { channelId } = req.params;

   if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
   }

   const serverPath = process.env.IMAGE_PATH_ORIGIN;

   const imageUrl = serverPath + "public/profiles/" + req.file.filename;

   try {
      const channel = await Channel.findByPk(channelId);

      if (!channel) {
         // Kanal bulunamazsa yüklenen resmi silme
         fs.unlinkSync(req.file.path);
         return res.status(404).json({ error: "Channel not found" });
      }

      if (channel.createdBy !== req.user.id) {
         // Kullanıcı Kanal sahibi değilse yüklenen resmi silme
         fs.unlinkSync(req.file.path);
         return res.status(400).json({ error: "Only the channel owner can change the channel image" });
      }

      // Kanal resmi URL güncellenmesi
      channel.image = imageUrl;
      await channel.save();

      let newChannel = await getChannelByIdAndFormat(channel.id);
      res.json(newChannel);
   } catch (err) {
      // Hata varsa yüklenen resmin silinmesi
      fs.unlinkSync(req.file.path);
      res.status(400).json({ error: err.message });
   }
});

router.delete("/channel/:channelId/image", auth, async (req, res) => {
   const { channelId } = req.params;
   try {
      const channel = await Channel.findByPk(channelId);

      if (!channel) {
         return res.status(404).json({ error: "Channel not found" });
      }

      if (channel.createdBy !== req.user.id) {
         return res.status(400).json({ error: "Only the channel owner can change the channel image" });
      }

      // Kanal resmi URL'inin sıfırlanması
      channel.image = null;
      await channel.save();
      let newChannel = await getChannelByIdAndFormat(channel.id);
      res.json(newChannel);
   } catch (err) {
      res.status(400).json({ error: err.message });
   }
});

router.patch("/profile/details", auth, async (req, res) => {
   const { error } = updateProfileSchema.validate(req.body);
   if (error) return res.status(400).json({ error: error.details[0].message });

   const { name, year, biography } = req.body;

   try {
      const user = await User.findByPk(req.user.id);

      if (!user) {
         return res.status(404).json({ error: "User not found" });
      }

      // Kullanıcı bilgilerini güncelleme
      user.name = name;
      user.year = year;
      user.biography = biography;
      await user.save();

      res.json(user);
   } catch (err) {
      res.status(400).json({ error: err.message });
   }
});

router.patch("/join-channel", auth, async (req, res) => {
   const { id } = req.body;

   try {
      const channel = await Channel.findByPk(id);

      if (!channel) {
         return res.status(404).json({ error: "Channel not found" });
      }

      const isChannelOwner = channel.createdBy === req.user.id;
      if (isChannelOwner) {
         return res.status(400).json({ error: "You cannot join a channel you created" });
      }

      const isMember = await ChannelMember.findOne({
         where: {
            UserId: req.user.id,
            ChannelId: channel.id,
         },
      });
      if (isMember) {
         return res.status(400).json({ error: "User is already a member of this channel" });
      }

      // Kanala üye ekleme
      await ChannelMember.create({
         UserId: req.user.id,
         ChannelId: channel.id,
      });

      // Alt kanala kullanıcıyı ekleme
      const generalSubChannel = await SubChannel.findOne({
         where: {
            name: "General",
            channelId: channel.id, // Channel ID 1 ise
         },
      });
      if (generalSubChannel) {
         await SubChannelMember.create({
            UserId: req.user.id,
            SubChannelId: generalSubChannel.id,
         });
      }

      // güncellenmiş kanalın çekilmesi
      const updatedChannel = await getChannelByIdAndFormat(channel.id);

      res.json(updatedChannel);
   } catch (err) {
      res.status(400).json({ error: err.message });
   }
});

async function formatChannel(data) {
   let obj = {
      _id: data.id,
      name: data.name,
      description: data.description,
      image: data.image,
      createdBy: data.createdBy,
   };
   let members = [];
   if (data.ChannelMembers.length > 0) {
      for (let item of data.ChannelMembers) members.push(item.UserId);
   }
   obj.members = members;
   return obj;
}
async function formatSubChannel(data) {
   let subChannel = [];
   if (data.length > 0) {
      for (let item of data) {
         let obj = {
            _id: item.id,
            name: item.name,
            topic: item.topic,
         };
         let members = [];
         if (item.SubChannelMembers.length > 0) {
            for (let item2 of item.SubChannelMembers) {
               members.push(item2.UserId);
            }
         }
         obj.members = members;
         subChannel.push(obj);
      }

      return subChannel;
   }
}

async function formatChannelComplete(createdChannel, createdSubChannel) {
   let obj = {
      _id: createdChannel.id,
      name: createdChannel.name,
      description: createdChannel.description,
      image: createdChannel.image,
      createdBy: createdChannel.createdBy,
   };
   let members = [];
   if (createdChannel.ChannelMembers.length > 0) {
      for (let item of createdChannel.ChannelMembers) members.push(item.UserId);
   }
   obj.members = members;

   let subChannel = [];
   if (createdSubChannel.length > 0) {
      for (let item of createdSubChannel) {
         let obj = {
            _id: item.id,
            name: item.name,
            topic: item.topic,
         };
         let members = [];
         if (item.SubChannelMembers.length > 0) {
            for (let item2 of item.SubChannelMembers) {
               members.push(item2.UserId);
            }
         }
         obj.members = members;
         subChannel.push(obj);
      }
   }
   obj.subChannels = subChannel;
   return obj;
}
function removeDuplicates(data) {
   const uniqueChannels = [];

   const seenIds = new Set();

   data.forEach((channel) => {
      if (!seenIds.has(channel._id)) {
         uniqueChannels.push(channel);
         seenIds.add(channel._id);
      } else {
         const existingChannelIndex = uniqueChannels.findIndex((ch) => ch._id === channel._id);
         if (existingChannelIndex !== -1) {
            const existingSubChannels = uniqueChannels[existingChannelIndex].subChannels.map((sub) =>
               JSON.stringify(sub)
            );
            const newSubChannels = channel.subChannels.map((sub) => JSON.stringify(sub));
            const uniqueSubChannels = new Set([...existingSubChannels, ...newSubChannels]);

            uniqueChannels[existingChannelIndex].subChannels = Array.from(uniqueSubChannels, (sub) => JSON.parse(sub));
         }
      }
   });

   return uniqueChannels;
}
async function getSubChannelByIdAndFormat(id) {
   let subChannel = await SubChannel.findOne({
      where: {
         id,
      },
      include: {
         model: SubChannelMember,
      },
   });
   let obj = {
      _id: subChannel.id,
      name: subChannel.name,
      topic: subChannel.topic,
   };
   let members = [];
   if (subChannel.SubChannelMembers.length > 0) {
      for (let item2 of subChannel.SubChannelMembers) {
         members.push(item2.UserId);
      }
   }

   return obj;
}

async function getChannelByIdAndFormat(id) {
   let channel = await Channel.findOne({
      where: {
         id,
      },
      include: [
         {
            model: ChannelMember,
         },
         {
            model: SubChannel,
            include: {
               model: SubChannelMember,
            },
         },
      ],
   });

   let obj = {
      _id: channel.id,
      name: channel.name,
      description: channel.description,
      image: channel.image,
      createdBy: channel.createdBy,
   };
   let members = [];
   if (channel.ChannelMembers.length > 0) {
      for (let item of channel.ChannelMembers) members.push(item.UserId);
   }
   obj.members = members;

   let subChannel = [];

   if (channel.SubChannels.length > 0) {
      for (let item of channel.SubChannels) {
         let obj = {
            _id: item.id,
            name: item.name,
            topic: item.topic,
         };
         let members = [];
         if (item.SubChannelMembers.length > 0) {
            for (let item2 of item.SubChannelMembers) {
               members.push(item2.UserId);
            }
         }
         obj.members = members;
         subChannel.push(obj);
      }
   }
   obj.subChannels = subChannel;
   return obj;
}

router.post("/channel", auth, async (req, res) => {
   const { name } = req.body;

   try {
      // Kanalı oluştur
      const newChannel = await Channel.create({ name, createdBy: req.user.id });

      // Genel alt kanalının oluşturulması
      const generalSubChannel = await SubChannel.create({
         name: "General",
         topic: "General subchannel",
         channelId: newChannel.id,
      });

      // kullancının kanal ve alt kanala katılması
      await ChannelMember.create({
         UserId: req.user.id,
         ChannelId: newChannel.id,
      });
      await SubChannelMember.create({
         UserId: req.user.id,
         SubChannelId: generalSubChannel.id,
      });
      let createdChannel = await Channel.findOne({
         where: {
            id: newChannel.id,
         },
         include: { model: ChannelMember },
      });
      let createdSubChannel = await SubChannel.findAll({
         where: {
            channelId: newChannel.id,
         },
         include: { model: SubChannelMember },
      });

      let response = await formatChannelComplete(createdChannel, createdSubChannel);
      res.status(201).json(response);
   } catch (err) {
      res.status(400).json({ error: err.message });
   }
});

router.get("/channel/:id", auth, async (req, res) => {
   const channelId = req.params.id;

   try {
      let createdChannel = await Channel.findOne({
         where: {
            id: channelId,
         },
         include: { model: ChannelMember },
      });
      let createdSubChannel = await SubChannel.findAll({
         where: {
            channelId: channelId,
         },
         include: { model: SubChannelMember },
      });

      let response = await formatChannelComplete(createdChannel, createdSubChannel);
      res.status(201).json(response);
   } catch (err) {
      res.status(400).json({ error: err.message });
   }
});

router.patch("/channel-name/:id", auth, async (req, res) => {
   const channelId = req.params.id;
   const { name } = req.body;

   try {
      const channel = await Channel.findByPk(channelId);

      if (!channel) {
         return res.status(404).json({ error: "Channel not found" });
      }

      if (channel.createdBy !== req.user.id) {
         return res.status(400).json({ error: "Only the channel owner can update the channel name" });
      }

      // Kanal isminin güncellenmesi
      channel.name = name;
      await channel.save();

      let response = await getChannelByIdAndFormat(channel.id);
      res.json(response);
   } catch (err) {
      res.status(400).json({ error: err.message });
   }
});

router.patch("/channel-description/:id", auth, async (req, res) => {
   const channelId = req.params.id;
   const { description } = req.body;

   try {
      const channel = await Channel.findByPk(channelId);

      if (!channel) {
         return res.status(404).json({ error: "Channel not found" });
      }

      // Kanal açıklamasının güncellenmesi
      channel.description = description;
      await channel.save();

      let response = await getChannelByIdAndFormat(channel.id);
      res.json(response);
   } catch (err) {
      res.status(400).json({ error: err.message });
   }
});

router.delete("/channel/:id", auth, async (req, res) => {
   const channelId = req.params.id;

   try {
      // Silinecek kanalın bulunması
      const channel = await Channel.findByPk(channelId);

      if (!channel) {
         return res.status(404).json({ error: "Channel not found" });
      }

      if (channel.createdBy !== req.user.id) {
         return res.status(400).json({ error: "Only the channel owner can delete the channel" });
      }

      // Kullanıcının üyesi veya sahibi olduğu tek kanalın bu olup olmadığını kontrol etme
      const userChannelsCount = await Channel.count({
         where: {
            createdBy: req.user.id,
         },
      });

      const memberChannelsCount = await Channel.count({
         where: {
            members: req.user.id,
         },
      });

      if (userChannelsCount + memberChannelsCount === 1) {
         return res.status(400).json({ error: "You cannot delete the last channel" });
      }

      // Kanalın silinmesi
      await channel.destroy();

      res.json({ message: "Channel deleted successfully" });
   } catch (err) {
      res.status(400).json({ error: err.message });
   }
});

router.patch("/leave-channel/:channelId", auth, async (req, res) => {
   const { channelId } = req.params;

   try {
      const channel = await Channel.findByPk(channelId);
      if (!channel) {
         return res.status(404).json({ error: "Channel not found" });
      }

      if (channel.createdBy === req.user.id) {
         return res.status(400).json({ error: "Owner cannot leave the channel" });
      }

      // Kullanıcıyı silmek için kanalın üye listesini güncellenmesi
      await ChannelMember.destroy({
         where: { ChannelId: channelId, UserId: req.user.id },
      });

      res.json({ message: "Left channel successfully" });
   } catch (err) {
      res.status(400).json({ error: err.message });
   }
});

// Kanalların çekilmesi
router.get("/get-all-channels", auth, async (req, res) => {
   try {
      const allChannels = await Channel.findAll();
      res.json(allChannels);
   } catch (err) {
      res.status(400).json({ error: err.message });
   }
});

router.get("/channel", auth, async (req, res) => {
   try {

      const channels = await Channel.findAll({
         where: {
            createdBy: req.user.id,
         },
         include: { model: ChannelMember },
      });

      const memberschannels = await Channel.findAll({
         include: [
            {
               model: ChannelMember,
               where: {
                  UserId: req.user.id,
               },
            },
         ],
      });

      let allChannels = [];
      for (let item of channels) {
         let createdSubChannel = await SubChannel.findAll({
            where: {
               channelId: item.id,
            },
            include: { model: SubChannelMember },
         });
         let response = await formatChannelComplete(item, createdSubChannel);
         allChannels.push(response);
      }
      for (let item of memberschannels) {
         let createdSubChannel = await SubChannel.findAll({
            where: {
               channelId: item.id,
            },
            include: { model: SubChannelMember },
         });
         let response = await formatChannelComplete(item, createdSubChannel);
         allChannels.push(response);
      }

      let result = await removeDuplicates(allChannels);
      res.json(result);
   } catch (err) {
      res.status(400).json({ error: err.message });
   }
});
// Kullanıcının herhangi bir alt kanalın sahibi veya üyesi olmadığı tüm kanalların çekilmesi
router.get("/get-all-channels-not-member", auth, async (req, res) => {
   try {
      const notOwnedChannels = await Channel.findAll({
         where: {
            createdBy: {
               [Op.ne]: req.user.id,
            },
         },
         include: [
            {
               model: ChannelMember,
               where: {
                  UserId: req.user.id,
               },
               required: false, // Kullanıcı üye olmasa bile kanalları dahil et
            },
            {
               model: SubChannel,
               include: [
                  {
                     model: SubChannelMember,
                     where: {
                        UserId: req.user.id,
                     },
                     required: false, // Kullanıcı üye olmasa bile alt kanalları dahil et
                  },
               ],
            },
         ],
      });

      let response = [];
      for (let channel of notOwnedChannels) {
         let formattedChannel = await getChannelByIdAndFormat(channel.id);
         response.push(formattedChannel);
      }

      res.json(response);
   } catch (err) {
      res.status(400).json({ error: err.message });
   }
});

// Not
router.get("/get-all-users-not-member/:channelId", auth, async (req, res) => {
   const { channelId } = req.params;

   try {
      // Kanalı bulma
      const channel = await Channel.findByPk(channelId);
      if (!channel) {
         return res.status(404).json({ error: "Channel not found" });
      }

      // Kullanıcıları bulma
      const allUsers = await User.findAll();

      // Kanalın kullanıcılarını bulma
      const channelMembers = await ChannelMember.findAll({
         where: { ChannelId: channelId },
         include: [{ model: User, as: "User" }],
      });

      // userid'lerin bulunması
      const memberIds = channelMembers.map((member) => member.User.id);

      // Kanala üye olan kullanıcıları filtreleme
      const notMemberUsers = allUsers.filter((user) => !memberIds.includes(user.id));

      res.json(notMemberUsers);
   } catch (err) {
      res.status(400).json({ error: err.message });
   }
});

router.post("/channels/:channelId/subchannels/create", auth, async (req, res) => {
   const { channelId } = req.params;
   const { name, topic } = req.body;
   const { error } = subChannelSchema.validate(req.body);
   if (error) return res.status(400).json({ error: error.details[0].message });

   try {
      const channel = await Channel.findByPk(channelId);
      if (!channel) {
         return res.status(404).json({ error: "Channel not found" });
      }

      const existingSubChannel = await SubChannel.findOne({ where: { channelId, name } });
      if (existingSubChannel) {
         return res.status(400).json({ error: "Sub-channel with this name already exists" });
      }

      const newSubChannel = await SubChannel.create({ name, topic, channelId });
      await SubChannelMember.create({
         SubChannelId: newSubChannel.id,
         UserId: req.user.id,
      });

      let response = await getSubChannelByIdAndFormat(newSubChannel.id);

      res.status(201).json(response);
   } catch (err) {
      res.status(400).json({ error: err.message });
   }
});

router.patch("/channels/:channelId/subchannels/:subChannelId", auth, async (req, res) => {
   const { channelId, subChannelId } = req.params;
   const { name, topic } = req.body;
   const { error } = subChannelSchema.validate(req.body);
   if (error) return res.status(400).json({ error: error.details[0].message });

   try {
      const channel = await Channel.findByPk(channelId);
      if (!channel) {
         return res.status(404).json({ error: "Channel not found" });
      }

      if (channel.createdBy !== req.user.id) {
         return res.status(400).json({ error: "Only the channel owner can update sub-channel details" });
      }

      const subChannel = await SubChannel.findByPk(subChannelId);
      if (!subChannel) {
         return res.status(404).json({ error: "Sub-channel not found" });
      }

      if (subChannel.name === "General") {
         return res.status(400).json({ error: "Cannot update General sub-channel" });
      }

      subChannel.name = name;
      subChannel.topic = topic;
      await subChannel.save();

      let response = await getSubChannelByIdAndFormat(subChannel.id);

      res.json(response);
   } catch (err) {
      res.status(400).json({ error: err.message });
   }
});

router.get("/channels/:channelId/subchannels/:subChannelId", auth, async (req, res) => {
   const { channelId, subChannelId } = req.params;

   try {
      const channel = await Channel.findByPk(channelId);
      if (!channel) {
         return res.status(404).json({ error: "Channel not found" });
      }

      const subChannel = await getSubChannelByIdAndFormat(subChannelId);
      if (!subChannel) {
         return res.status(404).json({ error: "Sub-channel not found" });
      }

      res.json(subChannel);
   } catch (err) {
      res.status(400).json({ error: err.message });
   }
});

// Belirli bir alt kanalı silme
router.delete("/channels/:channelId/subchannels/:subChannelId", auth, async (req, res) => {
   const { channelId, subChannelId } = req.params;

   try {
      const channel = await Channel.findByPk(channelId);
      if (!channel) {
         return res.status(404).json({ error: "Channel not found" });
      }

      if (channel.createdBy !== req.user.id) {
         return res.status(400).json({ error: "Only the channel owner can delete the sub-channel" });
      }

      const subChannelIndex = SubChannel.findOne({
         id: subChannelId,
      });
      if (!subChannelIndex) {
         return res.status(404).json({ error: "Sub-channel not found" });
      }

      // "Genel" alt kanalın silinmesini önleme
      if (subChannelIndex.name === "General") {
         return res.status(400).json({ error: "Cannot delete the General sub-channel" });
      }

      await SubChannel.destroy({
         where: { id: subChannelId },
      });

      let allsubChannels = await SubChannel.findAll({
         where: {
            channelId: channelId,
         },
         include: {
            model: SubChannelMember,
         },
      });
      let response = await formatSubChannel(allsubChannels);

      res.json(response);
   } catch (err) {
      res.status(400).json({ error: err.message });
   }
});

// Alt kanaldan ayrılma
// Belirli bir alt kanaldan ayrılma
router.put("/channels/:channelId/subchannels/:subChannelId", auth, async (req, res) => {
   const { channelId, subChannelId } = req.params;

   try {
      const channel = await Channel.findByPk(channelId);
      if (!channel) {
         return res.status(404).json({ error: "Channel not found" });
      }

      if (channel.createdBy === req.user.id) {
         return res.status(400).json({ error: "Channel owner cannot leave sub-channels" });
      }

      const subChannel = await SubChannel.findByPk(subChannelId);
      if (!subChannel) {
         return res.status(404).json({ error: "Sub-channel not found" });
      }

      // "Genel" alt kanaıldan ayrılmayı önleme
      if (subChannel.name === "General") {
         return res.status(400).json({ error: "Cannot leave the General sub-channel" });
      }

      await SubChannelMember.destroy({
         where: { SubChannelId: subChannelId, UserId: req.user.id },
      });

      let allsubChannels = await SubChannel.findAll({
         where: {
            channelId: channelId,
         },
         include: {
            model: SubChannelMember,
         },
      });
      let response = await formatSubChannel(allsubChannels);

      res.json(response);
   } catch (err) {
      res.status(400).json({ error: err.message });
   }
});

// Alt kanala katılma
router.put("/join/channels/:channelId/subchannels/:subChannelId", auth, async (req, res) => {
   const { channelId, subChannelId } = req.params;

   try {
      const channel = await Channel.findByPk(channelId);
      if (!channel) {
         return res.status(404).json({ error: "Channel not found" });
      }

      const subChannel = SubChannel.findOne({
         where: {
            id: subChannelId,
         },
      });
      if (!subChannel) {
         return res.status(404).json({ error: "Sub-channel not found" });
      }

      await SubChannelMember.create({
         UserId: req.user.id,
         SubChannelId: subChannelId,
      });

      let allsubChannels = await SubChannel.findAll({
         where: {
            channelId: channelId,
         },
         include: {
            model: SubChannelMember,
         },
      });
      let response = await formatSubChannel(allsubChannels);

      res.json(response);
   } catch (err) {
      res.status(400).json({ error: err.message });
   }
});

router.post("/upload", upload.single("file"), (req, res) => {
   if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
   }

   // Yüklenen dosya için URL oluşturma
   const serverPath = process.env.IMAGE_PATH_ORIGIN;
   const imageUrl = serverPath + "public/profiles/" + req.file.filename;

   res.json({ imageUrl });
});

router.post("/channels/:channelId/invite", auth, async (req, res) => {
   const { usersToInvite } = req.body;
   const { channelId } = req.params;

   try {
      const channel = await Channel.findByPk(channelId);
      if (!channel) {
         return res.status(404).json({ error: "Channel not found!" });
      }

      const memberChannel = await ChannelMember.findOne({
         where: {
            UserId: req.user.id,
            ChannelId: channel.id,
         },
      });

      if (!memberChannel) {
         return res.status(403).json({ error: "Only members can invite others" });
      }

      // Her kullanıcı için mevcut davetleri kontrol etme
      const existingInvites = await Invite.findAll({
         where: {
            channelId: channel.id,
            userId: { [Op.in]: usersToInvite },
         },
      });

      // Davet edilen kullancıların userid'leri
      const invitedUsers = new Set(existingInvites.map((invite) => invite.userId.toString()));

      // Davet edilen kullanıcılar
      const uniqueUsersToInvite = [...new Set(usersToInvite)].filter((user) => !invitedUsers.has(user));

      if (uniqueUsersToInvite.length === 0) {
         return res.status(200).json({ message: "User(s) already invited" });
      }

      const invites = uniqueUsersToInvite.map((user) => {
         return {
            channelId: channel.id,
            userId: user,
            inviterId: req.user.id,
         };
      });

      await Invite.bulkCreate(invites);

      res.status(200).json({ message: "User(s) invited successfully" });
   } catch (error) {
      res.status(400).json({ error: error.message });
   }
});

router.get("/invites", auth, async (req, res) => {
   try {
      const invites = await Invite.findAll({
         where: { userId: req.user.id },
         include: {
            model: Channel,
            attributes: ["name", "image"],
         },
      });
      res.json(invites);
   } catch (error) {
      res.status(400).json({ error: error.message });
   }
});

// Davet Kabulü
router.post("/invites/:inviteId/accept", auth, async (req, res) => {
   const { inviteId } = req.params;
   console.log(inviteId);

   try {
      const invite = await Invite.findByPk(inviteId);
      if (!invite) {
         return res.status(404).json({ error: "Invite not found" });
      }

      if (invite.userId !== req.user.id) {
         return res.status(403).json({ error: "Unauthorized" });
      }

      await Invite.destroy({ where: { id: inviteId } });

      const channel = await Channel.findByPk(invite.channelId, {
         include: {
            model: SubChannel,
            where: { name: "General" },
            include: SubChannelMember,
         },
      });

      if (!channel) {
         return res.status(404).json({ error: "Channel not found" });
      }

      const isMember = await ChannelMember.findOne({
         where: { UserId: invite.userId, ChannelId: invite.channelId },
      });

      if (!isMember) {
         await ChannelMember.create({ UserId: invite.userId, ChannelId: invite.channelId });

         if (channel.SubChannels && channel.SubChannels.length > 0) {
            const generalSubChannel = channel.SubChannels[0];
            await SubChannelMember.create({ UserId: invite.userId, SubChannelId: generalSubChannel.id });
         }
      }

      res.status(200).json({ message: "Invite accepted" });
   } catch (error) {
      res.status(400).json({ error: error.message });
   }
});

// Davet Reddi
router.post("/invites/:inviteId/reject", auth, async (req, res) => {
   const { inviteId } = req.params;

   try {
      const invite = await Invite.findByPk(inviteId);
      if (!invite) {
         return res.status(404).json({ error: "Invite not found" });
      }

      if (invite.userId !== req.user.id) {
         return res.status(403).json({ error: "Unauthorized" });
      }

      await Invite.destroy({ where: { id: inviteId } });

      res.status(200).json({ message: "Invite rejected", invite });
   } catch (error) {
      res.status(400).json({ error: error.message });
   }
});

router.post("/message", auth, async (req, res) => {
   const { message, channelId, subChannelId } = req.body;

   try {
      const channel = await Channel.findByPk(channelId, {
         include: [
            { model: ChannelMember, where: { UserId: req.user.id } },
            { model: SubChannel, where: { id: subChannelId }, include: [SubChannelMember] },
         ],
      });

      if (!channel) {
         return res.status(404).json({ error: "Channel not found" });
      }

      const subChannel = channel.SubChannels[0];
      if (!subChannel) {
         return res.status(404).json({ error: "Sub-channel not found" });
      }

      const isMember = await SubChannelMember.findOne({
         where: {
            SubChannelId: subChannelId,
            UserId: req.user.id,
         },
      });
      if (!isMember) {
         return res.status(403).json({ error: "User is not a member of this sub-channel" });
      }

      const newMessage = await Chat.create({
         subChannel: subChannelId,
         user: req.user.id,
         message,
      });

      const latestMessage = await Chat.findByPk(newMessage.id, {
         include: [{ model: User, as: "userDetails", attributes: ["name", "image", "email", "faculty"] }],
      });

      res.status(201).json(latestMessage);
   } catch (error) {
      res.status(400).json({ error: error.message });
   }
});

// Resimli mesaj gönderme
router.post(
   "/message/image/channel/:channelId/subchannel/:subChannelId",
   auth,
   upload.single("image"),
   async (req, res) => {
      const { channelId, subChannelId } = req.params;
      if (!req.file) {
         return res.status(400).json({ error: "No image file uploaded" });
      }

      const serverPath = process.env.IMAGE_PATH_ORIGIN;
      const imageUrl = `${serverPath}public/profiles/${req.file.filename}`;

      try {
         const channel = await Channel.findByPk(channelId, {
            include: [
               { model: ChannelMember, where: { UserId: req.user.id } },
               { model: SubChannel, where: { id: subChannelId }, include: [SubChannelMember] },
            ],
         });

         if (!channel) {
            return res.status(404).json({ error: "Channel not found" });
         }

         const subChannel = channel.SubChannels[0];
         if (!subChannel) {
            return res.status(404).json({ error: "Sub-channel not found" });
         }

         const isMember = await SubChannelMember.findOne({
            where: {
               SubChannelId: subChannelId,
               UserId: req.user.id,
            },
         });
         if (!isMember) {
            return res.status(403).json({ error: "User is not a member of this sub-channel" });
         }

         const newMessage = await Chat.create({
            subChannel: subChannelId,
            user: req.user.id,
            image: imageUrl,
         });

         const latestMessage = await Chat.findByPk(newMessage.id, {
            include: [{ model: User, as: "userDetails", attributes: ["name", "image", "email", "faculty"] }],
         });

         res.status(201).json(latestMessage);
      } catch (error) {
         res.status(400).json({ error: error.message });
      }
   }
);

// Mesaj gönderme
router.post(
   "/message/file/channel/:channelId/subchannel/:subChannelId",
   auth,
   upload.single("file"),
   async (req, res) => {
      const { channelId, subChannelId } = req.params;
      if (!req.file) {
         return res.status(400).json({ error: "No file uploaded" });
      }

      const serverPath = process.env.IMAGE_PATH_ORIGIN;
      const fileUrl = `${serverPath}public/profiles/${req.file.filename}`;

      try {
         const channel = await Channel.findByPk(channelId, {
            include: [
               { model: ChannelMember, where: { UserId: req.user.id } },
               { model: SubChannel, where: { id: subChannelId }, include: [SubChannelMember] },
            ],
         });

         if (!channel) {
            return res.status(404).json({ error: "Channel not found" });
         }

         const subChannel = channel.SubChannels[0];
         if (!subChannel) {
            return res.status(404).json({ error: "Sub-channel not found" });
         }

         const isMember = await SubChannelMember.findOne({
            where: {
               SubChannelId: subChannelId,
               UserId: req.user.id,
            },
         });
         if (!isMember) {
            return res.status(403).json({ error: "User is not a member of this sub-channel" });
         }

         const newMessage = await Chat.create({
            subChannel: subChannelId,
            user: req.user.id,
            attachment: fileUrl,
         });

         const latestMessage = await Chat.findByPk(newMessage.id, {
            include: [{ model: User, as: "userDetails", attributes: ["name", "image", "email", "faculty"] }],
         });

         res.status(201).json(latestMessage);
      } catch (error) {
         res.status(400).json({ error: error.message });
      }
   }
);
// Alt kanallardan mesajları alma
router.get("/channels/:channelId/subchannels/:subChannelId/messages", auth, async (req, res) => {
   const { channelId, subChannelId } = req.params;

   try {
      // const channel = await Channel.findByPk(channelId, {
      //    include: [{ model: SubChannel, where: { id: subChannelId } }],
      // });

      // if (!channel) {
      //    return res.status(404).json({ error: "Sub-channel not found" });
      // }

      // const subChannel = channel.SubChannels[0];
      // if (!subChannel) {
      //    return res.status(404).json({ error: "Sub-channel not found" });
      // }

      // const isMember = await SubChannelMember.findOne({
      //    where: { subChannelId, userId: req.user.id },
      // });

      // if (!isMember) {
      //    return res.status(403).json({ error: "User is not a member of this sub-channel" });
      // }

      const messages = await Chat.findAll({
         where: { subChannel: subChannelId },
         include: [{ model: User, as: "userDetails", attributes: ["name", "image", "email", "faculty"] }],
      });

      res.json(messages);
   } catch (error) {
      res.status(400).json({ error: error.message });
   }
});

// Alt kanal üyelerini bulma
router.get("/channels/:channelId/subchannels/:subChannelId/members", auth, async (req, res) => {
   const { channelId, subChannelId } = req.params;

   try {
      const subChannelMembers = await SubChannelMember.findAll({
         where: { SubChannelId: subChannelId },
         include: [{ model: User, as: "User" }],
      });
      // Üyeleri çekme
      const allUsers = await User.findAll();

      // Userid
      const memberIds = subChannelMembers.map((member) => member.User.id);

      // Üye olan kullanıcıları filtreleme
      const memberUsers = allUsers.filter((user) => memberIds.includes(user.id));

      res.json(memberUsers);
   } catch (error) {
      res.status(400).json({ error: error.message });
   }
});

// Alt kanal üyesi arama
router.get("/channels/:channelId/subchannels/:subChannelId/members/search", auth, async (req, res) => {
   const { channelId, subChannelId } = req.params;
   const { query } = req.query;

   try {
      const subChannelMembers = await SubChannelMember.findAll({
         where: { SubChannelId: subChannelId },
         include: [{ model: User, as: "User" }],
      });
      const allUsers = await User.findAll();

      const memberIds = subChannelMembers.map((member) => member.User.id);

      const memberUsers = allUsers.filter((user) => memberIds.includes(user.id));

      const searchedMembers = memberUsers.filter(
         (member) =>
            member.name.toLowerCase().includes(query.toLowerCase()) ||
            member.email.toLowerCase().includes(query.toLowerCase())
      );

      res.json(searchedMembers);
   } catch (error) {
      res.status(400).json({ error: error.message });
   }
});

// Kanal üyeleri
router.get("/channels/:channelId/members", auth, async (req, res) => {
   const { channelId } = req.params;

   try {
      const channelMembers = await ChannelMember.findAll({
         where: { ChannelId: channelId },
         include: [{ model: User, as: "User" }],
      });
      const allUsers = await User.findAll();

      const memberIds = channelMembers.map((member) => member.User.id);

      const memberUsers = allUsers.filter((user) => memberIds.includes(user.id));

      res.json(memberUsers);
   } catch (error) {
      res.status(400).json({ error: error.message });
   }
});

router.get("/channels/:channelId/members/search", auth, async (req, res) => {
   const { channelId } = req.params;
   const { query } = req.query;

   try {
      const channelMembers = await ChannelMember.findAll({
         where: { ChannelId: channelId },
         include: [{ model: User, as: "User" }],
      });
      const allUsers = await User.findAll();

      const memberIds = channelMembers.map((member) => member.User.id);

      const memberUsers = allUsers.filter((user) => memberIds.includes(user.id));

      const members = memberUsers.filter(
         (member) =>
            member.name.toLowerCase().includes(query.toLowerCase()) ||
            member.email.toLowerCase().includes(query.toLowerCase())
      );

      res.json(members);
   } catch (error) {
      res.status(400).json({ error: error.message });
   }
});

// Alt kanaldan ayrılma
router.post("/channels/:channelId/subchannels/:subChannelId/leave", auth, async (req, res) => {
   const { channelId, subChannelId } = req.params;

   try {
      const subChannelMember = await SubChannelMember.findOne({
         where: { subChannelId, userId: req.user.id },
      });

      if (!subChannelMember) {
         return res.status(404).json({ error: "Sub-channel not found or user not a member" });
      }

      await subChannelMember.destroy();

      res.json({ message: "Left sub-channel successfully" });
   } catch (error) {
      res.status(400).json({ error: error.message });
   }
});

module.exports = router;
