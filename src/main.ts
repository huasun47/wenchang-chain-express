
import { readFileSync } from 'fs'
import { join } from 'path'
import express, { Application, Request, Response } from "express";
import bodyParser from 'body-parser';
import { axios } from './request';


const app: Application = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", async (req: Request, res: Response): Promise<Response> => {
  const filePath = join(__dirname, 'templates/index.html')
  const html = readFileSync(filePath)
  return res.status(200).send(html.toString());
});
// 创建账户
app.post('/create/account', async (req: Request, res: Response): Promise<Response> => {
  const { name } = req.body

  const data = await axios({
    method: "post",
    url: "/avata/v1beta1/account",
    data: {
      name,
    },
  });
  return res.status(200).send(data);
})
// 查询账户
app.get('/account', async (req: Request, res: Response): Promise<Response> => {
  const { account } = req.query

  const data = await axios({
    method: "get",
    url: "/avata/v1beta1/accounts",
    params: {
      account,
    },
  });

  return res.status(200).send(data);
})

// 查询nft类别
app.get('/nfts/classes', async (req: Request, res: Response): Promise<Response> => {
  const data = await axios({
    method: "get",
    url: "/avata/v1beta1/nft/classes",
  })

  return res.status(200).send(data)
})

// 查询nft类别
app.get('/nfts/classes/:id', async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params
  const data = await axios({
    method: "get",
    url: `/avata/v1beta1/nft/classes/${id}`,
  })

  return res.status(200).send(data)
})

// bootstrap ---
const PORT = 4000;
try {
  app.listen(PORT, (): void => {
    console.log(`Connected successfully on port ${PORT}`);
  });
} catch (error: any) {
  console.error(`Error occured: ${error.message}`);
}