# PayPRO - Android ПОС холболт

[TOC]

## 1. Танилцуулга

Тус гарын авлага нь `Андройд` аппликейшнээс `PayPRO` төлбөрийн аппликэйшнтай холболт хийх талаар зааварчилгааг агуулсан болно.

## 1.1. Sequence Diagram

```seq
Client app->Payment app: Гүйлгээний хүсэлт\n
Note right of Payment app: Төлбөр төлөлт\nхийгдэнэ
Payment app->Client app: Гүйлгээний хариу
```

[==============]

## 1.2. Жишээ код

[Жишээ код (Java) - Татах](/apis/files/payprodemojava.zip)
[Жишээ код (Kotlin) - Татах](/apis/files/paypro-demo.zip)

[==============]

## 1.3. PayPRO SDK тохируулах

build.gradle файл дээр доорх байдлаар нэмж, sync хийх

```
implementation 'mn.lambda:paypro-sdk:1.0.42'
```

## 1.4. SDK функцуудтай ажиллах

PayProApi class нь SDK функцуудыг агуулсан байна.

### 1.4.1. SDK функцыг дуудаж ашиглах

```
class PayProApi {
    ...
    fun doSomething( // функцын нэр
        context: Context,
        callback: (PayProResponse<T>) -> Unit // хариу хүлээж авах callback
    )
    ...
}
```

### 1.4.2. Хүсэлтийн хариуг хүлээж авах

Callback функцын үрд дүнд ирж байгаа хариуг Амжилттай болон Амжилтгүй биелсэн эсэхийг дараах байдлаар шалгаж боловсруулна

```
api.doSomething(context) {
    when(it) {
        is PayProResponse.Success -> {
            // Амжилттай
            println(it.data)
        }
        is PayProResponse.Error -> {
            // Амжилтгүй
            println("алдаа: ${it.message}")
        }
    }
}
```

## 1.5. Гүйлгээ хийх

Гүйлгээ хийх функц.

```
class PayProApi {
    ...
    fun payment(
        context: Context,
        amount: Double, // Гүйлгээний дүн
        options: PaymentOptions,
        callback: (PayProResponse<PaymentResult>) -> Unit // Гүйлгээний хариу хүлээж авах callback
    )
    ...
}
```

[==============]

### 1.5.1. Гүйлгээ хийхэд шаардлагатай параметрүүд

| Параметр | Төрөл          | Тайлбар                     |
| -------- | -------------- | --------------------------- |
| amount   | double         | Гүйлгээ хийх дүн            |
| options  | PaymentOptions | Гүйлгээ хийх options утгууд |

`PaymentOptions` class нь дараах бүтэцтэй байна

```
class PaymentOptions(
    val payment: Int, // Төлбөрийн хэрэгслийн төрөл,
    val skipPrint: Boolean // Баримт хэвлэх эсэх
)
```

### 1.5.2. Төлбөрийн хэрэгслийн утга

| Утга | Төрөл                        | Тайлбар                                                         |
| ---- | ---------------------------- | --------------------------------------------------------------- |
| 0    | Төлбөрийн хэрэгсэл сонгоогүй | Боломжит бүх төлбөрийн хэрэгслийн сонголтууд пос дээр гарч ирнэ |
| 1    | Карт                         | Зөвхөн картын гүйлгээ хийх үед                                  |
| 3    | SocialPay                    | Зөвхөн SocialPay - QR код ашиглан гүйлгээ хийх үед              |
| 4    | Monpay                       | Зөвхөн Monpay - QR код ашиглан гүйлгээ хийх үед                 |

[==============]

### 1.5.3. Гүйлгээний хариу - Амжилттай

Гүйлгээ амжилттай болсон үед `PayProResponse.Success` төрөлтэй хариу ирэх байх ба гүйлгээний мэдээллийг `data` талбараас авна.

```
api.payment(context, amount, options) {
    when(it) {
        is PayProResponse.Success -> {
            // Амжилттай
            val data = it.data // PaymentResult төрөлтэй байна
        }
        is PayProResponse.Error -> {
            // Амжилтгүй
        }
    }
}

```

`PaymentResult` class нь дараах бүтэцтэй байна

```
class PaymentResult(
    val merchantId: String, // Мерчант дугаар
    val terminalId: String, // Терминал дугаар
    val amount: Double, // Гүйлгээ хийсэн дүн
    val traceno: String, // Гүйлгээний trace дугаар
    val batchno: String, // Гүйлгээний batch дугаар
    val maskedPAN: String, // Картын маскалсан дугаар
    val systemRef: String, // System ref дугаар
    val approveCode: String, // Зөвшөөрлийн код
    val date: String, // Гүйлгээ хийгдсэн огноо
)
```

### 1.5.4. Гүйлгээний хариу - Амжилтгүй

Амжилтгүй болсон үед `PayProResponse.Error` төрөлтэй хариу ирнэ. Шалтгааныг `message` талбараас авна.

```
api.cardPayment(context, amount) {
    when(it) {
        is PayProResponse.Success -> {
        }
        is PayProResponse.Error -> {
            // Амжилтгүй
            println("алдаа: ${it.message}")
        }
    }
}
```

[==============]

## 1.6. Баримт хэвлэх

POS төхөөрөмж дээр баримт хэвлэх үед ашиглана. Баримт хэвлэх талаар дэлгэрэнгүй жишээг Демо кодноос харна уу.

```
class PayProApi {
    ...
    fun print(
        context: Context,
        payload: String, // Баримтын хэвлэх дата
        callback: (PayProResponse<Empty>) -> Unit // Хэвлэх үйлдлийн хариуг хүлээж авах callback
    )
    ...
}
```

### 1.6.1. Баримт хэвлэхэд шаардлагатай параметрүүд

| Параметр | Төрөл  | Тайлбар                                                                     |
| -------- | ------ | --------------------------------------------------------------------------- |
| payload  | string | Хэвлэх мэдээллийг `json` форматтайгаар дамжуулна, жишээ кодтой танилцана уу |

### 1.6.2. Баримт Амжилттай хэвлэгдэх

Баримт амжилттай хэвлэгдсэн үед `PayProResponse.Success` төрөлтэй хариу ирнэ.

```
api.print(context, payload) {
    when(it) {
        is PayProResponse.Success -> {
            // Амжилттай
        }
        is PayProResponse.Error -> {
        }
    }
}
```

### 1.6.3. Баримт хэвлэлт амжилтгүй болох

Баримтын цаас дууссан эсвэл бусад тохиолдолд `PayProResponse.Error` төрөлтэй хариу ирнэ. Шалтгааныг `message` талбараас авна.

```
api.print(context, payload) {
    when(it) {
        is PayProResponse.Success -> {
        }
        is PayProResponse.Error -> {
            // Амжилтгүй
            println("алдаа: ${it.message}")
        }
    }
}
```

[==============]

## 1.7. ПОС Төхөөрөмжийн мэдээлэл авах

Пос төхөөрөмжийн мэдээлэл авах

```
class PayProApi {
    ...
    fun getDeviceInfo(
        context: Context,
        callback: (PayProResponse<DeviceInfo>) -> Unit // Төхөөрөмжийн мэдээлэл хүлээж авах callback
    )
    ...
}
```

[==============]

### 1.7.1. Төхөөрөмжийн мэдээлэл - Амжилттай

Төхөөрөмжийн мэдээлэл амжилттай авсан үед `PayProResponse.Success` төрөлтэй хариу ирэх байх ба төхөөрөмжийн мэдээллийг `data` талбараас авна.

```
api.getDeviceInfo(context) {
    when(it) {
        is PayProResponse.Success -> {
            // Амжилттай
            val data = it.data // DeviceInfo төрөлтэй байна
        }
        is PayProResponse.Error -> {
            // Амжилтгүй
        }
    }
}

```

`DeviceInfo` class нь дараа бүтэцтэй байна

```
class DeviceInfo(
    val serialNumber: String, // Төхөөрөмжийн Сериал дугаар
)
```

### 1.7.2. Төхөөрөмжийн мэдээлэл - Амжилтгүй

Амжилтгүй болсон үед `PayProResponse.Error` төрөлтэй хариу ирнэ. Шалтгааныг `message` талбараас авна.

```
api.getDeviceInfo(context) {
    when(it) {
        is PayProResponse.Success -> {
        }
        is PayProResponse.Error -> {
            // Амжилтгүй
            println("алдаа: ${it.message}")
        }
    }
}
```

## 1.8. NFC картын сериал дугаар авах

NFC картын сериал дугаар авах үед дараах функцыг дуудна

```
class PayProApi {
    ...
    fun readCardUID(
        context: Context,
        timeout: Int,
        callback: (PayProResponse<NFCCard>) -> Unit // NFC картын мэдээлэл хүлээж авах callback
    )
    ...
}
```

[==============]

### 1.8.1. NFC карт - Амжилттай

NFC карт амжилттай уншигдсан үед `PayProResponse.Success` төрөлтэй хариу ирэх байх ба картын мэдээллийг `data` талбараас авна.

```
api.readCardUID(context, timeout) {
    when(it) {
        is PayProResponse.Success -> {
            // Амжилттай
            val data = it.data // NFCCard төрөлтэй байна
        }
        is PayProResponse.Error -> {
            // Амжилтгүй
        }
    }
}

```

`NFCCard` class нь дараа бүтэцтэй байна

```
class NFCCard(
    val uid: String, // Картын UID
)
```

### 1.8.2. NFC карт - Амжилтгүй

Амжилтгүй болсон үед `PayProResponse.Error` төрөлтэй хариу ирнэ. Шалтгааныг `message` талбараас авна.

```
api.getDeviceInfo(context) {
    when(it) {
        is PayProResponse.Success -> {
        }
        is PayProResponse.Error -> {
            // Амжилтгүй
            println("алдаа: ${it.message}")
        }
    }
}
```

[==============]
