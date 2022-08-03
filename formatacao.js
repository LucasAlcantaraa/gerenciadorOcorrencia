module.exports = dataFormatada();

  function dataFormatada(){
  const data = new Date();
  const dataBR = data.toLocaleString('pt-br')
  const dataSemHora = dataBR.substr(0,10)
  const dataCortada = dataSemHora.split('/')
  const dia = dataCortada[0]
  const mes = dataCortada[1]
  const ano = dataCortada[2]
  const dataInvertida = `${ano}-${mes}-${dia}`

  return dataInvertida
}
