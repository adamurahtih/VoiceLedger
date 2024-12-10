import { v4 as uuidv4 } from "uuid";
import { StableBTreeMap } from "azle";
import express from "express";
import { time } from "azle";

// Struktur data untuk podcast/audio
class Podcast {
  id: string;
  title: string;
  description: string;
  audioURL: string;
  price: number; // Harga dalam crypto
  creator: string;
  createdAt: Date;
  updatedAt: Date | null;
}

const podcastStorage = StableBTreeMap<string, Podcast>(0);

const app = express();
app.use(express.json());

// Menambahkan podcast/audio baru
app.post("/podcasts", (req, res) => {
  const podcast: Podcast = {
    id: uuidv4(),
    createdAt: getCurrentDate(),
    updatedAt: null,
    ...req.body,
  };
  podcastStorage.insert(podcast.id, podcast);
  res.json(podcast);
});

// Mendapatkan semua podcast/audio
app.get("/podcasts", (req, res) => {
  res.json(podcastStorage.values());
});

// Mendapatkan podcast/audio berdasarkan ID
app.get("/podcasts/:id", (req, res) => {
  const podcastId = req.params.id;
  const podcastOpt = podcastStorage.get(podcastId);
  if (!podcastOpt) {
    res.status(404).send(`Podcast with id=${podcastId} not found`);
  } else {
    res.json(podcastOpt);
  }
});

// Memperbarui podcast/audio
app.put("/podcasts/:id", (req, res) => {
  const podcastId = req.params.id;
  const podcastOpt = podcastStorage.get(podcastId);
  if (!podcastOpt) {
    res
      .status(400)
      .send(`Couldn't update podcast with id=${podcastId}. Podcast not found`);
  } else {
    const podcast = podcastOpt;
    const updatedPodcast = {
      ...podcast,
      ...req.body,
      updatedAt: getCurrentDate(),
    };
    podcastStorage.insert(podcast.id, updatedPodcast);
    res.json(updatedPodcast);
  }
});

// Menghapus podcast/audio
app.delete("/podcasts/:id", (req, res) => {
  const podcastId = req.params.id;
  const deletedPodcast = podcastStorage.remove(podcastId);
  if (!deletedPodcast) {
    res
      .status(400)
      .send(`Couldn't delete podcast with id=${podcastId}. Podcast not found`);
  } else {
    res.json(deletedPodcast);
  }
});

app.listen();

function getCurrentDate() {
  const timestamp = Number(time());
  return new Date(timestamp.valueOf() / 1_000_000);
}
